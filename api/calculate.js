export default async function handler(req, res) {
  try {
    const {
      param1,
      param2 = 0,
      operation,
      round = false,
      decimal_places = 2,
      random_number = false,
      random_length = 6
    } = req.body;

    let param3 = null;
    let result = null;

    // 🔥 RANDOM NUMBER LOGIC
    if (random_number) {
      if (![4, 5, 6].includes(random_length)) {
        return res.status(400).json({
          error: "random_length must be 4, 5, or 6"
        });
      }

      const min = Math.pow(10, random_length - 1);
      const max = Math.pow(10, random_length) - 1;

      param3 = Math.floor(min + Math.random() * (max - min + 1));
    }

    // 🔧 MATH LOGIC
    if (param1 !== undefined && operation) {
      switch (operation) {
        case "add":
        case "add_with_param3":
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

        case "percentage":
          result = (param1 / 100) * param2;
          break;

        default:
          return res.status(400).json({
            error: "Invalid operation"
          });
      }

      // 🔁 ROUNDING (USER CONTROLLED)
      if (round) {
        if (decimal_places < 0 || decimal_places > 10) {
          return res.status(400).json({
            error: "decimal_places must be between 0 and 10"
          });
        }

        result = Number(result.toFixed(decimal_places));
      }
    }

    // 🔴 VALIDATION
    if (!random_number && (param1 === undefined || !operation)) {
      return res.status(400).json({
        error: "Either enable random_number OR provide param1 + operation"
      });
    }

    // 🕒 UNIX TIME
    const currentUnix = Math.floor(Date.now() / 1000);
    const expiry = currentUnix + 1800;

    // ✅ FINAL RESPONSE
    return res.status(200).json({
      success: true,
      input: {
        param1,
        param2,
        operation,
        round,
        decimal_places,
        random_number,
        random_length
      },
      result,
      param3,
      currentUnix,
      expiry
    });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message
    });
  }
}
