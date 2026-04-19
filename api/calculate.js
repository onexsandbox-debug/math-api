export default async function handler(req, res) {
  try {
    const {
      param1,
      param2 = 0,
      operation,
      round = false,
      decimal_places = 2,
      random_number = false,
      random_length = 6,
      date_param,
      in_date_format,    // New: Specify how to read input (e.g., "DDMMYYYY")
      req_date_format    // New: Specify how to format output (e.g., "YYYY-MM-DD")
    } = req.body;

    let param3 = null;
    let result = null;
    let formatted_date = null;

    // 📅 ENHANCED CHOICE-BASED DATE LOGIC
    if (date_param) {
      let d = null;
      
      // Handle Choice-Based Input Parsing
      if (in_date_format && /^\d{8}$/.test(date_param)) {
        const p1 = date_param.substring(0, 2);
        const p2 = date_param.substring(2, 4);
        const year = date_param.substring(4, 8);

        if (in_date_format === "DDMMYYYY") {
          d = new Date(`${year}-${p2}-${p1}`);
        } else if (in_date_format === "MMDDYYYY") {
          d = new Date(`${year}-${p1}-${p2}`);
        }
      } else {
        // Fallback to standard JS parsing for ISO strings or other formats
        d = new Date(date_param);
      }

      if (d && !isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();

        // Choice-Based Output Formatting
        const formatMap = {
          "DDMMYYYY": `${dd}${mm}${yyyy}`,
          "MMDDYYYY": `${mm}${dd}${yyyy}`,
          "DD-MM-YYYY": `${dd}-${mm}-${yyyy}`,
          "MM-DD-YYYY": `${mm}-${dd}-${yyyy}`,
          "DD/MM/YYYY": `${dd}/${mm}/${yyyy}`,
          "MM/DD/YYYY": `${mm}/${dd}/${yyyy}`,
          "YYYY-MM-DD": `${yyyy}-${mm}-${dd}`,
          "YYYYMMDD": `${yyyy}${mm}${dd}`
        };

        formatted_date = formatMap[req_date_format] || d.toISOString();
      } else {
        return res.status(400).json({ error: "Invalid date or format mismatch" });
      }
    }

    // 🔥 RANDOM NUMBER LOGIC (24-char safe)
    if (random_number) {
      if (typeof random_length !== 'number' || random_length < 1 || random_length > 24) {
        return res.status(400).json({ error: "random_length must be 1-24" });
      }
      let str = "";
      for (let i = 0; i < random_length; i++) {
        str += i === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10);
      }
      param3 = str;
    }

    // 🔧 MATH LOGIC
    if (param1 !== undefined && operation) {
      switch (operation) {
        case "add": result = param1 + param2; break;
        case "subtract": result = param1 - param2; break;
        case "multiply": result = param1 * param2; break;
        case "divide": 
          if (param2 === 0) return res.status(400).json({ error: "Division by zero" });
          result = param1 / param2; 
          break;
        case "percentage": result = (param1 / 100) * param2; break;
        default: return res.status(400).json({ error: "Invalid operation" });
      }
      if (round) result = Number(result.toFixed(decimal_places));
    }

    const currentUnix = Math.floor(Date.now() / 1000);

    return res.status(200).json({
      success: true,
      result,
      param3,
      formatted_date,
      currentUnix,
      expiry: currentUnix + 1800
    });

  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
}
