import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const {
      param1,
      param2 = 0,
      operation,
      round = false,
      round_digits = 2
    } = req.body;

    // Validation
    if (param1 === undefined || !operation) {
      return res.status(400).json({
        error: "param1 and operation are required"
      });
    }

    let result;

    // Math Operations
    switch (operation) {
      case "add":
        result = param1 + param2;
        break;

      case "subtract":
        result = param1 - param2;
        break;

      case "multiply":
        result = param1 * param2;
        break;

      case "divide":
        if (param2 === 0) {
          return res.status(400).json({
            error: "Division by zero not allowed"
          });
        }
        result = param1 / param2;
        break;

      default:
        return res.status(400).json({
          error: "Invalid operation"
        });
    }

    // Rounding
    if (round) {
      result = Number(result.toFixed(round_digits));
    }

    // Get timestamp from external API
    const timeResponse = await axios.get(
      "https://aisenseapi.com/services/v1/timestamp"
    );

    const currentTimestamp = timeResponse.data.timestamp;

    // Add 30 mins
    const expire_by = currentTimestamp + 1800;

    return res.status(200).json({
      success: true,
      input: {
        param1,
        param2,
        operation,
        round,
        round_digits
      },
      result,
      timestamp: currentTimestamp,
      expire_by
    });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong",
      details: error.response?.data || error.message
    });
  }
}
