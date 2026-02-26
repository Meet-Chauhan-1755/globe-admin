const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const axios = require("axios"); 

const app = express();

/* ================= BRANCH MASTER ================= */
const branchMaster = [
  { city: "Mumbai", manager: "Rohit Mishra", phone: "9137413105", lat: 19.0760, lng: 72.8777 },
  { city: "Wada", manager: "Rohit Mishra", phone: "9137413105", lat: 19.6500, lng: 73.1500 },
  { city: "Ahmedabad", manager: "G.P. Sharma", phone: "9909925687", lat: 23.0225, lng: 72.5714 },
  { city: "Narol", manager: "G.P. Sharma", phone: "9909925687", lat: 22.9700, lng: 72.6000 },
  { city: "Goa", manager: "K.K. Mukade", phone: "9970798550", lat: 15.2993, lng: 74.1240 },
  { city: "Pune", manager: "Virendra Mishra", phone: "9714143350", lat: 18.5204, lng: 73.8567 },
  { city: "Jaipur", manager: "Moolchand", phone: "9314648285", lat: 26.9124, lng: 75.7873 },
  { city: "Varanasi", manager: "Nand Kishor", phone: "8935004572", lat: 25.3176, lng: 82.9739 },
  { city: "Kolkata", manager: "Jagdish Yadav", phone: "8100479788", lat: 22.5726, lng: 88.3639 },
  { city: "Howrah", manager: "Jagdish Yadav", phone: "8100479788", lat: 22.5958, lng: 88.2636 },
  { city: "Ranchi", manager: "Shambhu", phone: "9973065558", lat: 23.3441, lng: 85.3096 },
  { city: "Cuttack", manager: "Rajan Biswal", phone: "7008919834", lat: 20.4625, lng: 85.8830 },
  { city: "Bhubaneswar", manager: "Rajan Biswal", phone: "7008919834", lat: 20.2961, lng: 85.8245 },
  { city: "Chennai", manager: "Bhup Singh", phone: "7200322146", lat: 13.0827, lng: 80.2707 },
  { city: "Pondicherry", manager: "Bhup Singh", phone: "7200322146", lat: 11.9416, lng: 79.8083 },
  { city: "Indore", manager: "Ramesh Ji", phone: "8619316288", lat: 22.7196, lng: 75.8577 },
  { city: "Pithampur", manager: "Ramesh Ji", phone: "8619316288", lat: 22.6013, lng: 75.6975 },
  { city: "Coimbatore", manager: "Devendra Rajput", phone: "8695969993", lat: 11.0168, lng: 76.9558 },
  { city: "Raipur", manager: "Bhagwati Ji", phone: "7389909906", lat: 21.2514, lng: 81.6296 },
  { city: "Bangalore", manager: "Kiran", phone: "8050142354", lat: 12.9716, lng: 77.5946 },
  { city: "Jamnagar", manager: "Sunil Jadhav", phone: "9909925707", lat: 22.4707, lng: 70.0577 },
  { city: "Rajkot", manager: "Sunil Jadhav", phone: "9909925707", lat: 22.3039, lng: 70.8022 },
  { city: "Ambala", manager: "Nitin Sharma", phone: "9662819837", lat: 30.3752, lng: 76.7821 },
  { city: "Punjab", manager: "Nitin Sharma", phone: "9662819837", lat: 31.1471, lng: 75.3412 },
  { city: "Vapi", manager: "Vivek Pandey", phone: "7046413584", lat: 20.3893, lng: 72.9106 },
  { city: "Bhopal", manager: "Surendra Yadav", phone: "8160230811", lat: 23.2599, lng: 77.4126 },
  { city: "Rudrapur", manager: "Subham Pandey", phone: "9003057362", lat: 28.9875, lng: 79.4141 },
  { city: "Vadodara", manager: "Dayasankar Pandey", phone: "9909925695", lat: 22.3072, lng: 73.1812 },
  { city: "Durgapur", manager: "Dharmendra Mishra", phone: "9330109731", lat: 23.5204, lng: 87.3119 },
  { city: "Haridwar", manager: "Vishal Tiwari", phone: "8477022561", lat: 29.9457, lng: 78.1642 },
  { city: "Kanpur", manager: "Uma Shanker Mishra", phone: "8933947777", lat: 26.4499, lng: 80.3319 },
  { city: "Surat", manager: "Mohan Agarwal", phone: "9712991116", lat: 21.1702, lng: 72.8311 },
  { city: "Kharagpur", manager: "Ravi Ranjan", phone: "8945967300", lat: 22.3460, lng: 87.2319 },
  { city: "Delhi", manager: "Shiva Pandey", phone: "9639067825", lat: 28.6139, lng: 77.2090 }
];

/* ================= AUDIT LOG HELPER ================= */
function logEvent(rfq, message) {
    if (!rfq.history) rfq.history = [];
    rfq.history.push({
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        message: message
    });
}

/* ================= BRANCH ALLOCATION LOGIC ================= */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getBranchByPincode(pincode) {
    if (!pincode || pincode.length < 2) return null;
    const p2 = pincode.toString().substring(0, 2); 
    const p3 = pincode.toString().substring(0, 3); 

    const districtMap = {
        "382": "Narol", "421": "Wada", "396": "Vapi", 
        "453": "Pithampur", "641": "Coimbatore",
        "711": "Howrah", "721": "Kharagpur", "713": "Durgapur"
    };

    const stateMap = {
        "11": "Delhi", "12": "Ambala", "14": "Punjab",
        "20": "Kanpur", "22": "Varanasi", "24": "Rudrapur", "26": "Haridwar",
        "30": "Jaipur", "36": "Rajkot", "37": "Jamnagar", "38": "Ahmedabad", "39": "Surat",
        "40": "Mumbai", "41": "Pune", "42": "Vadodara", "44": "Nagpur",
        "45": "Indore", "46": "Bhopal", "49": "Raipur",
        "56": "Bangalore", "57": "Bangalore", "58": "Bangalore",
        "60": "Chennai", "605": "Pondicherry",
        "70": "Kolkata", "75": "Bhubaneswar", "751": "Cuttack",
        "83": "Ranchi", "403": "Goa"
    };

    const cityName = districtMap[p3] || stateMap[p2];
    return branchMaster.find(b => b.city === cityName) || null;
}

async function determineBranch(pincode, address, selectedBranch = "AUTO") {
    let branchInfo = null;
    if (selectedBranch !== "AUTO") {
        branchInfo = branchMaster.find(b => b.city === selectedBranch);
        if (branchInfo) return branchInfo;
    }
    branchInfo = getBranchByPincode(pincode);
    if (branchInfo) return branchInfo;
    const addrLower = (address || "").toLowerCase();
    for (const b of branchMaster) {
        if (addrLower.includes(b.city.toLowerCase())) return b;
    }
    if (address && address.length > 2) {
        try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", India")}`;
            const geoRes = await axios.get(geoUrl, { headers: { "User-Agent": "GlobeApp/1.0" } });
            if (geoRes.data && geoRes.data.length > 0) {
                const lat = parseFloat(geoRes.data[0].lat);
                const lon = parseFloat(geoRes.data[0].lon);
                let minDistance = Infinity;
                branchMaster.forEach(branch => {
                    const dist = getDistance(lat, lon, branch.lat, branch.lng);
                    if (dist < minDistance) {
                        minDistance = dist;
                        branchInfo = branch;
                    }
                });
            }
        } catch (err) { console.error("Geocoding Error"); }
    }
    return branchInfo;
}

/* ================= BASIC SETUP ================= */
app.use(express.json());
app.use(express.static("public"));
app.use(session({
  secret: "globe-enterprise-secret",
  resave: false,
  saveUninitialized: false
}));

const DB_PATH = path.join(__dirname, "database.json");
function readDB() {
  if (!fs.existsSync(DB_PATH)) return [];
  const content = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(content || "[]");
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4));
}

const USERS = [
  { username: "admin", password: "123", role: "admin" },
  { username: "ops1", password: "123", role: "ops" },
  { username: "ops2", password: "123", role: "ops" },
  { username: "ops3", password: "123", role: "ops" },
  { username: "ops4", password: "123", role: "ops" },
  { username: "ops5", password: "123", role: "ops" },
  { username: "ops6", password: "123", role: "ops" },
  { username: "ops7", password: "123", role: "ops" },
  { username: "ops8", password: "123", role: "ops" },
  { username: "ops9", password: "123", role: "ops" },
  { username: "ops10", password: "123", role: "ops" }
];

function requireAuth(req, res, next) { if (req.session.user) return next(); res.redirect("/login.html"); }
function requireAdmin(req, res, next) { if (req.session.role === "admin") return next(); res.redirect("/login.html"); }

/* ================= ROUTES ================= */

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.json({ success: false });
  req.session.user = user.username;
  req.session.role = user.role;
  res.json({ success: true, role: user.role });
});

app.get("/logout", (req, res) => { req.session.destroy(() => res.redirect("/login.html")); });

app.post("/admin/create-rfq", requireAdmin, async (req, res) => {
    try {
        const rfqs = readDB();
        const branchInfo = await determineBranch(req.body.pickup_pincode, req.body.pickup_city, req.body.branch);

        const newRFQ = {
            id: rfqs.length > 0 ? rfqs[rfqs.length - 1].id + 1 : 1,
            company: req.body.company,
            subject: req.body.subject, 
            branch: branchInfo ? branchInfo.city : "Unassigned",
            branch_manager: branchInfo ? branchInfo.manager : "Unassigned",
            manager_phone: branchInfo ? branchInfo.phone : "-",
            assigned_to: req.body.assigned_to, 
            pickup_city: req.body.pickup_city,
            delivery_city: req.body.delivery_city,
            pickup_pincode: req.body.pickup_pincode,
            delivery_pincode: req.body.delivery_pincode,
            material: req.body.material,
            vehicle_type: req.body.vehicle_type,
            dimensions: {
                length: (req.body.dimensions ? req.body.dimensions.length : req.body.length) || "0",
                breadth: (req.body.dimensions ? req.body.dimensions.breadth : req.body.breadth) || "0",
                height: (req.body.dimensions ? req.body.dimensions.height : req.body.height) || "0"
            },
            weight: req.body.weight || "0",
            status: { floated: false, costing_received: false, quotation_done: false, order_received: null },
            quotation_amount: null,
            admin_remark: req.body.admin_remark || "-",
            management_remark: "-",
            customer_remark: "-",
            history: [],
            created_at: new Date().toLocaleDateString()
        };

        logEvent(newRFQ, `RFQ Created by Admin and assigned to ${req.body.assigned_to}`);
        rfqs.push(newRFQ);
        writeDB(rfqs);
        res.json({ success: true, rfqId: newRFQ.id }); 
    } catch (error) { res.status(500).json({ success: false }); }
});

app.get("/admin/rfqs", requireAdmin, (req, res) => res.json(readDB()));

app.delete("/admin/rfq/:id", requireAdmin, (req, res) => {
    let rfqs = readDB();
    rfqs = rfqs.filter(r => r.id != req.params.id);
    writeDB(rfqs);
    res.json({ success: true });
});

/* ================= OPS ROUTES ================= */

app.get("/ops/rfqs", requireAuth, (req, res) => {
    const rfqs = readDB();
    const filtered = rfqs.filter(r => r.assigned_to === req.session.user);
    res.json(filtered);
});

app.put("/ops/float/:id", requireAuth, (req, res) => {
    let rfqs = readDB();
    const r = rfqs.find(x => x.id == req.params.id);
    if(r) { 
        r.status.floated = true; 
        logEvent(r, "RFQ Status: Floated (WhatsApp message generated for branch)");
        writeDB(rfqs); 
        res.json({success:true}); 
    }
    else res.json({success:false});
});

app.put("/ops/costing/:id", requireAuth, (req, res) => {
    let rfqs = readDB();
    const r = rfqs.find(x => x.id == req.params.id);
    if(r) { 
        r.status.costing_received = true; 
        if(req.body.amount) r.costing_amount = req.body.amount; 
        logEvent(r, `RFQ Status: Costing Received (Amount: ₹${req.body.amount || 'Updated'})`);
        writeDB(rfqs); 
        res.json({success:true}); 
    }
    else res.json({success:false});
});

app.put("/ops/quote/:id", requireAuth, (req, res) => {
    let rfqs = readDB();
    const r = rfqs.find(x => x.id == req.params.id);
    if(r) { 
        r.status.quotation_done = true; 
        r.quotation_amount = req.body.amount;
        logEvent(r, `RFQ Status: Quotation Completed (Final Quote: ₹${req.body.amount})`);
        writeDB(rfqs); res.json({success:true}); 
    } else res.json({success:false});
});

app.put("/ops/order/:id", requireAuth, (req, res) => {
    let rfqs = readDB();
    const r = rfqs.find(x => x.id == req.params.id);
    if(r) { 
        r.status.order_received = req.body.received; 
        if (req.body.received === false && req.body.reason) {
            r.loss_reason = req.body.reason;
            logEvent(r, `RFQ CLOSED: Order Lost. Reason: ${req.body.reason}`);
        } else if (req.body.received === true) {
            r.loss_reason = null; 
            logEvent(r, "RFQ CLOSED: Order WON! Status updated to Received.");
        }
        writeDB(rfqs); 
        res.json({success:true}); 
    }
    else res.json({success:false});
});

/* ================= UPDATE RFQ ================= */

app.put("/admin/update-rfq/:id", requireAuth, async (req, res) => {
    let rfqs = readDB();
    const index = rfqs.findIndex(r => r.id == req.params.id);
    if (index !== -1) {
        const branchInfo = await determineBranch(req.body.pickup_pincode, req.body.pickup_city, "AUTO");

        const updatedDimensions = {
            length: (req.body.dimensions ? req.body.dimensions.length : req.body.length) || rfqs[index].dimensions.length,
            breadth: (req.body.dimensions ? req.body.dimensions.breadth : req.body.breadth) || rfqs[index].dimensions.breadth,
            height: (req.body.dimensions ? req.body.dimensions.height : req.body.height) || rfqs[index].dimensions.height
        };

        const updatedData = {
            ...req.body,
            branch: branchInfo ? branchInfo.city : rfqs[index].branch,
            branch_manager: branchInfo ? branchInfo.manager : rfqs[index].branch_manager,
            manager_phone: branchInfo ? branchInfo.phone : rfqs[index].manager_phone,
            dimensions: updatedDimensions
        };

        rfqs[index] = { ...rfqs[index], ...updatedData };
        logEvent(rfqs[index], `RFQ details manually updated by ${req.session.role}`);
        writeDB(rfqs);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

/* ================= REMARK UPDATE ================= */

app.put('/ops/update-remark/:id', requireAuth, (req, res) => {
    const rfqId = req.params.id;
    const { type, remark } = req.body;

    let rfqs = readDB();
    const rfq = rfqs.find(r => r.id == rfqId);

    if (!rfq) return res.status(404).json({ message: "RFQ ID not found" });

    if (type === 'management') rfq.management_remark = remark;
    else if (type === 'customer') rfq.customer_remark = remark;
    else if (type === 'admin') rfq.admin_remark = remark;
    else return res.status(400).json({ message: "Invalid remark type" });

    logEvent(rfq, `Remark Updated (${type}): ${remark.substring(0, 30)}${remark.length > 30 ? '...' : ''}`);
    writeDB(rfqs);
    res.json({ success: true, message: "Remark updated successfully" });
});

/* ================= ANALYTICS REPORT ================= */

/* ================= ANALYTICS REPORT (MINUTES) ================= */
app.get("/admin/efficiency-report", requireAuth, (req, res) => {
    const rfqs = readDB();
    const stats = {};

    rfqs.forEach(rfq => {
        const ops = rfq.assigned_to;
        if (!ops || ops === "Unassigned" || !rfq.history) return;

        if (!stats[ops]) {
            stats[ops] = { name: ops, count: 0, floatTimes: [], costTimes: [], quoteTimes: [] };
        }

        const logs = rfq.history;

        const parseTimestamp = (ts) => {
            try {
                const parts = ts.split(', ');
                const dateParts = parts[0].split('/');
                const timeParts = parts[1].split(':');
                return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]).getTime();
            } catch(e) { return null; }
        };

        const getTime = (phrase) => {
            const entry = logs.find(l => l.message.includes(phrase));
            return entry ? parseTimestamp(entry.timestamp) : null;
        };

        const tCreated = getTime("Created");
        const tFloated = getTime("Floated");
        const tCosting = getTime("Costing Received");
        const tQuoted  = getTime("Quotation Completed");

        // CALCULATE MINUTES (Difference / 60,000)
        if (tCreated && tFloated) stats[ops].floatTimes.push((tFloated - tCreated) / 60000);
        if (tFloated && tCosting) stats[ops].costTimes.push((tCosting - tFloated) / 60000);
        if (tCosting && tQuoted)  stats[ops].quoteTimes.push((tQuoted - tCosting) / 60000);
        
        stats[ops].count++;
    });

    let report = Object.values(stats).map(s => ({
        ops: s.name,
        total: s.count,
        // Using Math.round for clean minute display
        avgFloat: s.floatTimes.length ? Math.round(s.floatTimes.reduce((a,b)=>a+b,0)/s.floatTimes.length) : 0,
        avgCost: s.costTimes.length ? Math.round(s.costTimes.reduce((a,b)=>a+b,0)/s.costTimes.length) : 0,
        avgQuote: s.quoteTimes.length ? Math.round(s.quoteTimes.reduce((a,b)=>a+b,0)/s.quoteTimes.length) : 0
    }));

    if(req.session.role === 'ops') {
        report = report.filter(r => r.ops === req.session.user);
    }

    res.json(report);
});
/* ================= UTILITY ROUTES ================= */

app.get("/api/generate-whatsapp/:id", requireAuth, (req, res) => {
    const rfqs = readDB();
    const r = rfqs.find(x => x.id == req.params.id);
    if(!r) return res.status(404).send("RFQ Not Found");

    const message = `*Costing Needed (${r.company})*\n\n` +
                    `*Email Subject Line:* ${r.subject || 'N/A'}\n` +
                    `*RFQ ID:* ${r.id}\n\n` +
                    `Dear ${r.branch_manager},\n` +
                    `Kindly provide costing for the below inquiry.\n\n` +
                    `*Pickup address and city:* ${r.pickup_city || 'N/A'}\n` +
                    `*Delivery address and city:* ${r.delivery_city || 'N/A'}\n\n` +
                    `*Material Type:* ${r.material || 'N/A'}\n` +
                    `*Material Weight:* ${r.weight || '0'} MT\n\n` +
                    `*Material Length:* ${r.dimensions?.length || '0'} FT\n` +
                    `*Material Width:* ${r.dimensions?.breadth || '0'} FT\n` +
                    `*Material Height:* ${r.dimensions?.height || '0'} FT\n\n` +
                    `*Vehicle Type:* ${r.vehicle_type || 'N/A'}\n\n` +
                    `Costing Inclusive of Transportation + RTO Expense + Other Expenses\n` +
                    `Detention Amount`;

    res.json({ url: `https://wa.me/?text=${encodeURIComponent(message)}` });
});

app.get("/", (req, res) => { res.redirect("/login.html"); });
app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));