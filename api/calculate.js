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
      in_date_format,
      req_date_format,
      time_param,
      req_time_format
    } = req.body;

    let param3 = null;
    let result = null;
    let formatted_date = null;
    let formatted_time = null;

    // 🕒 IST CONVERSION LOGIC (+5:30 from UTC)
    const getISTDate = () => {
      const now = new Date();
      // IST is UTC + 5.5 hours
      const istOffset = 5.5 * 60 * 60 * 1000; 
      return new Date(now.getTime() + istOffset);
    };

    let d = (date_param && date_param.trim() !== "") ? null : getISTDate();
    
    // 📅 DATE PARSING
    if (date_param && date_param.trim() !== "") {
      if (in_date_format && /^\d{8}$/.test(date_param)) {
        const p1 = date_param.substring(0, 2);
        const p2 = date_param.substring(2, 4);
        const year = date_param.substring(4, 8);
        d = in_date_format === "DDMMYYYY" ? new Date(`${year}-${p2}-${p1}`) : new Date(`${year}-${p1}-${p2}`);
      } else {
        d = new Date(date_param);
      }
    }

    // ⌚ TIME PARSING
    if (time_param && time_param.trim() !== "" && d && !isNaN(d.getTime())) {
      const timeRegex = /(\d{1,2})[:.]?(\d{2})[:.]?(\d{0,2})\s*(AM|PM)?/i;
      const match = time_param.match(timeRegex);
      if (match) {
        let [_, hours, mins, secs, ampm] = match;
        hours = parseInt(hours);
        mins = parseInt(mins);
        secs = parseInt(secs) || 0;
        if (ampm && ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
        if (ampm && ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
        d.setHours(hours, mins, secs);
      }
    }

    // 📤 FORMATTING OUTPUTS (Using UTC methods to bypass server local time)
    if (d && !isNaN(d.getTime())) {
      // If we used the IST offset, we use UTC getters to extract the shifted time
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = d.getUTCFullYear();
      const HH = d.getUTCHours();
      const mmTime = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      const h12 = HH % 12 || 12;
      const ampm = HH >= 12 ? 'PM' : 'AM';

      const dateMap = {
        "DDMMYYYY": `${dd}${mm}${yyyy}`,
        "MMDDYYYY": `${mm}${dd}${yyyy}`,
        "DD-MM-YYYY": `${dd}-${mm}-${yyyy}`,
        "MM-DD-YYYY": `${mm}-${dd}-${yyyy}`,
        "YYYY-MM-DD": `${yyyy}-${mm}-${dd}`
      };
      formatted_date = dateMap[req_date_format] || `${dd}-${mm}-${yyyy}`;

      const timeMap = {
        "HH:mm": `${String(HH).padStart(2, '0')}:${mmTime}`,
        "HH:mm:ss": `${String(HH).padStart(2, '0')}:${mmTime}:${ss}`,
        "hh:mm A": `${String(h12).padStart(2, '0')}:${mmTime} ${ampm}`,
        "hh:mm:ss A": `${String(h12).padStart(2, '0')}:${mmTime}:${ss} ${ampm}`,
        "HHmmss": `${String(HH).padStart(2, '0')}${mmTime}${ss}`
      };
      formatted_time = timeMap[req_time_format] || `${String(HH).padStart(2, '0')}:${mmTime}:${ss}`;
    }

    // 🔥 RANDOM NUMBER LOGIC (24-char safe)
    if (random_number) {
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
      }
      if (round) result = Number(result.toFixed(decimal_places));
    }

    // 🕒 UNIX TIME (Adjusted for IST)
    const istNow = getISTDate();
    const currentUnix = Math.floor(istNow.getTime() / 1000);

    return res.status(200).json({
      success: true,
      result,
      param3,
      formatted_date,
      formatted_time,
      currentUnix,
      expiry: currentUnix + 1800
    });

  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
}
