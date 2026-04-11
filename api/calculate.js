export default async function handler(req, res) {
  try {
    const { param1, param2 = 0, operation, round = false } = req.body;

    let result;

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
          return res.status(400).json({ error: "Division by zero not allowed" });
        }
        result = param1 / param2;
        break;

      case "percentage":
        result = (param1 / 100) * param2;
        break;

      default:
        return res.status(400).json({ error: "Invalid operation" });
    }

    if (round) {
      result = Number(result.toFixed(2));
    }

    // ✅ Better UNIX time (no external API)
    const currentUnix = Math.floor(Date.now() / 1000);
    const expiry = currentUnix + 1800;

    res.status(200).json({
      success: true,
      operation,
      input: { param1, param2, round },
      result,
      currentUnix,
      expiry
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
