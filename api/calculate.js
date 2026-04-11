export default async function handler(req, res) {
  try {
    const {
      param1,
      param2 = 0,
      operation,
      round = false,
      random_number = false,
      random_length = 6
    } = req.body;

    let param3 = null;

    // 🔥 RANDOM NUMBER GENERATION
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

    // 🔴 Validation
    if (param1 === undefined || !operation) {
      return res.status(400).json({
        error: "param1 and operation are required"
      });
    }

    let result;

    // 🔧 ONLY param1 & param2 used for math
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

    // 🔁 Rounding
    if (round) {
      result = Number(result.toFixed(2));
    }

    // 🕒 UNIX TIME
    const currentUnix = Math.floor(Date.now() / 1000);
    const expiry = currentUnix + 1800;

    // ✅ FINAL RESPONSE (exact format you want)
    return res.status(200).json({
      success: true,
      input: {
        param1,
        param2,
        operation,
        random_number,
        random_length
      },
      result,
      param3,   // 👈 directly in response
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
