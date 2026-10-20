import json
import runpy
import unittest
from pathlib import Path


MODULE = runpy.run_path(
    str(Path(__file__).resolve().parents[1] / "scripts" / "description_generator.py")
)


class ErrorMessageGeneratorTests(unittest.TestCase):
    def test_templates_return_valid_json_with_special_characters(self):
        value = 'Không thấy "CUST\\42"\n{customer}'
        context = {
            "error_code": "EXAMPLE_ERROR",
            "specific_message": value,
            "how_to_resolve": "Kiểm tra ID",
            "correct_format": "CUST-######",
            "field": "customer_id",
            "received_value": value,
            "expected_format": "CUST-######",
            "seconds": "2",
        }
        generator = MODULE["ErrorMessageGenerator"]()
        for error_type, field, expected in (
            ("NOT_FOUND", "message", value),
            ("INVALID_INPUT", "message", f"Invalid customer_id: {value}"),
            ("RATE_LIMITED", "retry_after", "2"),
            ("UNKNOWN", "message", f"Invalid customer_id: {value}"),
        ):
            with self.subTest(error_type=error_type):
                result = json.loads(generator.generate(error_type, context))
                self.assertEqual(result["error"], context["error_code"])
                self.assertEqual(result[field], expected)

    def test_missing_context_is_rejected(self):
        with self.assertRaisesRegex(KeyError, "error_code"):
            MODULE["ErrorMessageGenerator"]().generate("NOT_FOUND", {})


if __name__ == "__main__":
    unittest.main()
