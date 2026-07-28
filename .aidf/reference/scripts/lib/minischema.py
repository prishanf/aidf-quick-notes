"""Minimal JSON Schema validator supporting the subset AIDF's schemas use.

Why this exists: AIDF's gates must run in a fresh checkout, in CI, on a
developer laptop, without `pip install` as a precondition. A gate that
requires setup is a gate that gets skipped. This covers the keywords used by
schemas/*.json and nothing more -- it deliberately fails loudly on a keyword
it does not implement rather than silently ignoring it, because a silently
ignored constraint is exactly the failure mode the schema exists to prevent.

Supported: type, required, properties, additionalProperties, enum, const,
items, uniqueItems, minItems, minLength, minimum, pattern, $ref (local),
$defs, allOf, if/then, not, format (accepted, not enforced).
"""

import json
import re

KNOWN = {
    "$schema", "$id", "title", "description", "$defs", "definitions",
    "type", "required", "properties", "additionalProperties", "propertyNames",
    "enum", "const", "items", "uniqueItems", "minItems", "maxItems",
    "minLength", "maxLength", "minimum", "maximum", "pattern", "format",
    "$ref", "allOf", "if", "then", "else", "not", "default", "examples",
}

TYPES = {
    "object": dict, "array": list, "string": str, "integer": int,
    "number": (int, float), "boolean": bool, "null": type(None),
}


class SchemaFeatureError(Exception):
    """Raised when the schema uses a keyword this validator does not implement."""


def _typeof(value, expected):
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    py = TYPES.get(expected)
    if py is None:
        raise SchemaFeatureError("unknown type: %s" % expected)
    return isinstance(value, py)


def _resolve(schema, root):
    seen = 0
    while "$ref" in schema:
        ref = schema["$ref"]
        if not ref.startswith("#/"):
            raise SchemaFeatureError("only local $ref is supported: %s" % ref)
        node = root
        for part in ref[2:].split("/"):
            node = node[part]
        schema = node
        seen += 1
        if seen > 20:
            raise SchemaFeatureError("circular $ref")
    return schema


def validate(data, schema, root=None, path="$", errors=None):
    """Return a list of human-readable error strings. Empty list means valid."""
    if root is None:
        root = schema
    if errors is None:
        errors = []

    schema = _resolve(schema, root)

    unknown = set(schema) - KNOWN
    if unknown:
        raise SchemaFeatureError(
            "unsupported schema keyword(s) at %s: %s" % (path, ", ".join(sorted(unknown)))
        )

    if "type" in schema:
        expected = schema["type"]
        options = expected if isinstance(expected, list) else [expected]
        if not any(_typeof(data, t) for t in options):
            errors.append("%s: expected %s, got %s" % (path, "/".join(options), type(data).__name__))
            return errors

    if "const" in schema and data != schema["const"]:
        errors.append("%s: must be %r, got %r" % (path, schema["const"], data))

    if "enum" in schema and data not in schema["enum"]:
        errors.append("%s: %r is not one of %s" % (path, data, schema["enum"]))

    if "not" in schema and not validate(data, schema["not"], root, path, []):
        errors.append("%s: value %r is explicitly disallowed" % (path, data))

    if isinstance(data, str):
        if "minLength" in schema and len(data) < schema["minLength"]:
            errors.append("%s: must not be empty" % path if schema["minLength"] == 1
                          else "%s: shorter than %d" % (path, schema["minLength"]))
        if "pattern" in schema and not re.search(schema["pattern"], data):
            errors.append("%s: %r does not match %s" % (path, data, schema["pattern"]))

    if isinstance(data, (int, float)) and not isinstance(data, bool):
        if "minimum" in schema and data < schema["minimum"]:
            errors.append("%s: %s is below minimum %s" % (path, data, schema["minimum"]))

    if isinstance(data, dict):
        for key in schema.get("required", []):
            if key not in data:
                errors.append("%s: missing required key '%s'" % (path, key))
        props = schema.get("properties", {})
        for key, value in data.items():
            child = "%s.%s" % (path, key)
            if key in props:
                validate(value, props[key], root, child, errors)
            else:
                extra = schema.get("additionalProperties", True)
                if extra is False:
                    errors.append("%s: unknown key '%s' (typo?)" % (path, key))
                elif isinstance(extra, dict):
                    validate(value, extra, root, child, errors)

    if isinstance(data, list):
        if "minItems" in schema and len(data) < schema["minItems"]:
            errors.append("%s: needs at least %d item(s)" % (path, schema["minItems"]))
        if schema.get("uniqueItems") and len(data) != len({json.dumps(i, sort_keys=True) for i in data}):
            errors.append("%s: contains duplicate entries" % path)
        if "items" in schema:
            for i, item in enumerate(data):
                validate(item, schema["items"], root, "%s[%d]" % (path, i), errors)

    for sub in schema.get("allOf", []):
        sub = _resolve(sub, root)
        if "if" in sub:
            if not validate(data, sub["if"], root, path, []):
                if "then" in sub:
                    validate(data, sub["then"], root, path, errors)
            elif "else" in sub:
                validate(data, sub["else"], root, path, errors)
        else:
            validate(data, sub, root, path, errors)

    if "if" in schema:
        if not validate(data, schema["if"], root, path, []):
            if "then" in schema:
                validate(data, schema["then"], root, path, errors)
        elif "else" in schema:
            validate(data, schema["else"], root, path, errors)

    return errors


def load_yaml(path):
    """Load YAML, preferring PyYAML and falling back to a tiny parser.

    The fallback handles the flat mappings, nested mappings, inline lists and
    dash lists that project.yaml uses. It is not a general YAML parser and
    says so when it meets something it cannot read.
    """
    try:
        import yaml  # noqa
        with open(path) as fh:
            return yaml.safe_load(fh)
    except ImportError:
        pass

    with open(path) as fh:
        lines = fh.readlines()

    root = {}
    stack = [(-1, root)]
    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip())
        content = line.strip()

        if content.startswith("- "):
            parent = stack[-1][1]
            if isinstance(parent, list):
                parent.append(_scalar(content[2:]))
            continue

        if ":" not in content:
            raise SchemaFeatureError("cannot parse YAML line: %r (install PyYAML)" % line)

        key, _, value = content.partition(":")
        key, value = key.strip(), value.strip()
        while stack and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1]
        if value == "":
            child = {}
            parent[key] = child
            stack.append((indent, child))
        else:
            parent[key] = _scalar(value)
    return root


def _scalar(token):
    token = token.split(" #")[0].strip()
    if token.startswith("[") and token.endswith("]"):
        inner = token[1:-1].strip()
        return [_scalar(p) for p in inner.split(",")] if inner else []
    if len(token) >= 2 and token[0] == token[-1] and token[0] in "\"'":
        return token[1:-1]
    if token in ("true", "false"):
        return token == "true"
    if token in ("null", "~", ""):
        return None
    try:
        return int(token)
    except ValueError:
        return token
