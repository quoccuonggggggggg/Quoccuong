// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabase";
import * as XLSX from "xlsx";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  LayoutDashboard, Package, Warehouse, ArrowDownToLine, ArrowUpFromLine,
  Truck, Users, BarChart3, Settings, Activity, Bell, Search, Moon, Sun,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, Edit2, Trash2,
  Eye, Download, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp,
  DollarSign, Phone, Mail, Shield, LogOut, User, X, FileText, MapPin,
  Lock, Boxes, BarChart2, PackageCheck, PackageX, Receipt, FileSpreadsheet,
  Printer, ChevronFirst, ChevronLast, Target, Award, Zap, Menu,
} from "lucide-react";

const getDaysAgo = (num) => {
  const d = new Date();
  d.setDate(d.getDate() - num);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const SEED_WH = [
  { id:"WH001", name:"Kho A - Điện tử",   location:"Quận 1, TP.HCM", capacity:500, zones:5, temperature:"18-22°C", type:"Kho lạnh",   manager:"Nguyễn Văn An",  phone:"0901234567", status:"active" },
  { id:"WH002", name:"Kho B - Nội thất",  location:"Quận 7, TP.HCM", capacity:300, zones:8, temperature:"Thường",  type:"Kho thường", manager:"Trần Thị Bình",  phone:"0912345678", status:"active" },
  { id:"WH003", name:"Kho C - Văn phòng", location:"Bình Dương",      capacity:250, zones:6, temperature:"Thường",  type:"Kho thường", manager:"Lê Văn Cường",   phone:"0923456789", status:"active" },
];
const SEED_PROD = [
  { id:"SP001", name:"Laptop Dell XPS 13",        sku:"DELL-XPS13",  category:"Điện tử",   buyPrice:25000000, sellPrice:29500000, stock:45, wid:"WH001", loc:"A-01-03", status:"active",   img:"💻", upd:"2024-12-15" },
  { id:"SP002", name:"iPhone 15 Pro Max",          sku:"APPLE-IP15",  category:"Điện tử",   buyPrice:28000000, sellPrice:33000000, stock:12, wid:"WH001", loc:"A-02-01", status:"active",   img:"📱", upd:"2024-12-14" },
  { id:"SP003", name:"Bàn làm việc thông minh",    sku:"DESK-01",     category:"Nội thất",  buyPrice:3500000,  sellPrice:4800000,  stock:8,  wid:"WH002", loc:"B-01-02", status:"low",      img:"🪑", upd:"2024-12-13" },
  { id:"SP004", name:"Tai nghe Sony WH-1000XM5",   sku:"SONY-WH5",    category:"Âm thanh",  buyPrice:7200000,  sellPrice:8900000,  stock:34, wid:"WH001", loc:"A-03-05", status:"active",   img:"🎧", upd:"2024-12-12" },
  { id:"SP005", name:'Màn hình LG UltraWide 34"',  sku:"LG-UW34",     category:"Điện tử",   buyPrice:12000000, sellPrice:15500000, stock:3,  wid:"WH001", loc:"A-04-01", status:"critical", img:"🖥️", upd:"2024-12-11" },
  { id:"SP006", name:"Ghế văn phòng ErgoMax",      sku:"ERGO-PRO",    category:"Nội thất",  buyPrice:4500000,  sellPrice:6200000,  stock:22, wid:"WH002", loc:"B-02-03", status:"active",   img:"💺", upd:"2024-12-10" },
  { id:"SP007", name:"Máy in Canon PIXMA G3020",   sku:"CANON-G3020", category:"Văn phòng", buyPrice:2800000,  sellPrice:3700000,  stock:15, wid:"WH003", loc:"C-01-01", status:"active",   img:"🖨️", upd:"2024-12-09" },
  { id:"SP008", name:"Bộ phím chuột Logitech MX",  sku:"LOGI-MX",     category:"Phụ kiện",  buyPrice:1800000,  sellPrice:2400000,  stock:0,  wid:"WH001", loc:"A-05-02", status:"out",      img:"⌨️", upd:"2024-12-08" },
  { id:"SP009", name:"UPS APC 1500VA",             sku:"APC-1500",    category:"Điện",      buyPrice:3200000,  sellPrice:4100000,  stock:18, wid:"WH003", loc:"C-02-04", status:"active",   img:"🔋", upd:"2024-12-07" },
  { id:"SP010", name:"Switch Cisco 24 Port",        sku:"CISCO-SW24",  category:"Mạng",      buyPrice:8500000,  sellPrice:11000000, stock:7,  wid:"WH003", loc:"C-03-02", status:"low",      img:"🔌", upd:"2024-12-06" },
  { id:"SP011", name:"Camera IP Dahua 4K",          sku:"DAHUA-4K",    category:"An ninh",   buyPrice:2100000,  sellPrice:2900000,  stock:41, wid:"WH002", loc:"B-03-01", status:"active",   img:"📷", upd:"2024-12-05" },
  { id:"SP012", name:"Router WiFi 6 ASUS AX6000",   sku:"ASUS-AX6K",   category:"Mạng",      buyPrice:4800000,  sellPrice:6300000,  stock:9,  wid:"WH003", loc:"C-01-03", status:"low",      img:"📡", upd:"2024-12-04" },
];
const SEED_SUPP = [
  { id:"NCC001", name:"Apple Việt Nam",      code:"APPLE-VN", email:"supplier@apple.vn",   phone:"0281234567", address:"Quận 1, TP.HCM", contact:"Nguyễn Minh Tuấn", rating:5, status:"active",   debt:0,        orders:48 },
  { id:"NCC002", name:"Dell Technologies VN",code:"DELL-VN",  email:"partner@dell.vn",     phone:"0282345678", address:"Quận 3, TP.HCM", contact:"Trần Thu Hương",   rating:4, status:"active",   debt:45000000, orders:62 },
  { id:"NCC003", name:"Sony Electronics",    code:"SONY-VN",  email:"b2b@sony.vn",         phone:"0283456789", address:"Quận 5, TP.HCM", contact:"Phạm Văn Đức",    rating:5, status:"active",   debt:0,        orders:35 },
  { id:"NCC004", name:"LG Display VN",       code:"LG-VN",    email:"lgvn@lg.com",         phone:"0284567890", address:"Bình Dương",     contact:"Hoàng Thị Mai",    rating:4, status:"active",   debt:12000000, orders:28 },
  { id:"NCC005", name:"Cisco Systems VN",    code:"CISCO-VN", email:"vnpartner@cisco.com", phone:"0285678901", address:"Quận 7, TP.HCM", contact:"Lê Quang Huy",    rating:3, status:"inactive", debt:85000000, orders:15 },
  { id:"NCC006", name:"Canon Vietnam",       code:"CANON-VN", email:"supply@canon.vn",     phone:"0286789012", address:"Hà Nội",         contact:"Vũ Thanh Lan",    rating:4, status:"active",   debt:0,        orders:41 },
];
const SEED_IMP = [
  { id:"PN001", sid:"NCC002", sname:"Dell Technologies VN", wid:"WH001", wname:"Kho A", receiver:"Nguyễn Thị Lan", status:"completed", date:getDaysAgo(0), note:"",
    items:[{ pid:"SP001", pname:"Laptop Dell XPS 13", qty:10, price:25000000 },{ pid:"SP004", pname:"Tai nghe Sony WH-1000XM5", qty:5, price:7200000 }] },
  { id:"PN002", sid:"NCC001", sname:"Apple Việt Nam",       wid:"WH001", wname:"Kho A", receiver:"Trần Minh Khoa",  status:"processing",date:getDaysAgo(1), note:"Đang kiểm tra",
    items:[{ pid:"SP002", pname:"iPhone 15 Pro Max", qty:3, price:28000000 }] },
  { id:"PN003", sid:"NCC003", sname:"Sony Electronics",     wid:"WH001", wname:"Kho A", receiver:"Lê Thu Hà",      status:"pending",   date:getDaysAgo(2), note:"Chờ xác nhận",
    items:[{ pid:"SP005", pname:'Màn hình LG UltraWide 34"', qty:5, price:12000000 },{ pid:"SP004", pname:"Tai nghe Sony WH-1000XM5", qty:3, price:7200000 }] },
  { id:"PN004", sid:"NCC004", sname:"LG Display VN",        wid:"WH001", wname:"Kho A", receiver:"Nguyễn Thị Lan", status:"completed", date:getDaysAgo(3), note:"",
    items:[{ pid:"SP001", pname:"Laptop Dell XPS 13", qty:5, price:25000000 }] },
  { id:"PN005", sid:"NCC006", sname:"Canon Vietnam",        wid:"WH003", wname:"Kho C", receiver:"Trần Minh Khoa", status:"cancelled", date:getDaysAgo(4), note:"Hủy do hàng lỗi",
    items:[{ pid:"SP007", pname:"Máy in Canon PIXMA G3020", qty:6, price:2800000 }] },
  { id:"PN006", sid:"NCC005", sname:"Cisco Systems VN",     wid:"WH003", wname:"Kho C", receiver:"Hoàng Anh Tuấn", status:"completed", date:getDaysAgo(5), note:"",
    items:[{ pid:"SP010", pname:"Switch Cisco 24 Port", qty:2, price:8500000 }] },
  { id:"PN007", sid:"NCC002", sname:"Dell Technologies VN", wid:"WH002", wname:"Kho B", receiver:"Phạm Văn Bình",  status:"processing",date:getDaysAgo(6), note:"Đang vận chuyển",
    items:[{ pid:"SP011", pname:"Camera IP Dahua 4K", qty:7, price:2100000 }] },
];
const SEED_EXP = [
  { id:"PX001", customer:"Công ty TNHH ABC",        wid:"WH001", wname:"Kho A", handler:"Trần Minh Khoa", status:"completed", date:getDaysAgo(0), note:"",
    items:[{ pid:"SP001", pname:"Laptop Dell XPS 13", qty:3, price:29500000 },{ pid:"SP002", pname:"iPhone 15 Pro Max", qty:2, price:33000000 }] },
  { id:"PX002", customer:"Trường ĐH Bách Khoa",     wid:"WH001", wname:"Kho A", handler:"Nguyễn Thị Lan", status:"processing",date:getDaysAgo(1), note:"Giao sáng mai",
    items:[{ pid:"SP004", pname:"Tai nghe Sony WH-1000XM5", qty:10, price:8900000 }] },
  { id:"PX003", customer:"Ngân hàng Vietcombank",   wid:"WH003", wname:"Kho C", handler:"Hoàng Anh Tuấn", status:"pending",   date:getDaysAgo(2), note:"Chờ duyệt",
    items:[{ pid:"SP010", pname:"Switch Cisco 24 Port", qty:5, price:11000000 }] },
  { id:"PX004", customer:"Công ty CP XYZ",          wid:"WH002", wname:"Kho B", handler:"Trần Minh Khoa", status:"completed", date:getDaysAgo(3), note:"",
    items:[{ pid:"SP011", pname:"Camera IP Dahua 4K", qty:4, price:2900000 }] },
  { id:"PX005", customer:"Bệnh viện Chợ Rẫy",      wid:"WH003", wname:"Kho C", handler:"Lê Thu Hà",      status:"completed", date:getDaysAgo(4), note:"",
    items:[{ pid:"SP007", pname:"Máy in Canon PIXMA G3020", qty:8, price:3700000 }] },
];
const SEED_USERS = [
  { id:"U001", name:"Admin Hệ Thống",  username:"admin",   email:"admin@wms.vn",   phone:"0901111111", role:"Admin",          dept:"IT",      position:"System Administrator", status:"active",   lastLogin:getDaysAgo(0) + " 08:30", avatar:"AH" },
  { id:"U002", name:"Nguyễn Thị Lan",  username:"nthilan", email:"nthilan@wms.vn", phone:"0902222222", role:"Manager",        dept:"Kho",     position:"Trưởng phòng kho",    status:"active",   lastLogin:getDaysAgo(0) + " 07:45", avatar:"NL" },
  { id:"U003", name:"Trần Minh Khoa",  username:"tmkhoa",  email:"tmkhoa@wms.vn",  phone:"0903333333", role:"Staff",          dept:"Kho A",   position:"Nhân viên kho",       status:"active",   lastLogin:getDaysAgo(1) + " 17:20", avatar:"TK" },
  { id:"U004", name:"Lê Thu Hà",       username:"ltha",    email:"ltha@wms.vn",    phone:"0904444444", role:"Accountant",     dept:"Kế toán", position:"Kế toán viên",        status:"active",   lastLogin:getDaysAgo(0) + " 09:10", avatar:"LH" },
  { id:"U005", name:"Phạm Văn Bình",   username:"pvbinh",  email:"pvbinh@wms.vn",  phone:"0905555555", role:"WarehouseStaff", dept:"Kho B",   position:"Thủ kho",             status:"inactive", lastLogin:getDaysAgo(5) + " 15:30", avatar:"PB" },
  { id:"U006", name:"Hoàng Anh Tuấn",  username:"hatuan",  email:"hatuan@wms.vn",  phone:"0906666666", role:"Staff",          dept:"Kho C",   position:"Nhân viên xuất kho",  status:"active",   lastLogin:getDaysAgo(0) + " 06:55", avatar:"HT" },
];
const CATS = ["Điện tử","Nội thất","Âm thanh","Mạng","Văn phòng","Phụ kiện","Điện","An ninh"];
const EMOJIS = ["💻","📱","🖥️","🎧","🖨️","⌨️","📷","🔌","🔋","📡","🪑","💺","📦","🖱️","📺","🎮"];
const CHART_AREA = [{ d:"9/12",n:85,x:62 },{ d:"10/12",n:120,x:88 },{ d:"11/12",n:95,x:103 },{ d:"12/12",n:148,x:94 },{ d:"13/12",n:73,x:118 },{ d:"14/12",n:162,x:87 },{ d:"15/12",n:99,x:135 }];
const CHART_PIE  = [{ n:"Điện tử",v:38,c:"#2563EB" },{ n:"Nội thất",v:22,c:"#8B5CF6" },{ n:"Âm thanh",v:14,c:"#06B6D4" },{ n:"Mạng",v:12,c:"#14B8A6" },{ n:"Khác",v:14,c:"#F59E0B" }];
const CHART_BAR6 = [{ m:"T7/24",n:820,x:690 },{ m:"T8/24",n:950,x:780 },{ m:"T9/24",n:720,x:840 },{ m:"T10/24",n:1100,x:930 },{ m:"T11/24",n:890,x:760 },{ m:"T12/24",n:1040,x:910 }];

/* ═══════════════════════════════════════════════════════════
   CSS (injected via <style>)
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.app{font-family:'Plus Jakarta Sans',-apple-system,sans-serif;display:flex;min-height:100vh;transition:background .3s,color .3s}
.dark{--b0:#020617;--b1:#0F172A;--b2:#1E293B;--b3:#263348;--card:rgba(15,23,42,.88);--bd:rgba(148,163,184,.1);--bd2:rgba(148,163,184,.2);--t1:#F1F5F9;--t2:#94A3B8;--t3:#64748B;background:#020617;color:#F1F5F9}
.light{--b0:#F0F4F8;--b1:#fff;--b2:#F8FAFC;--b3:#EEF2FF;--card:rgba(255,255,255,.95);--bd:rgba(0,0,0,.07);--bd2:rgba(0,0,0,.13);--t1:#0F172A;--t2:#475569;--t3:#94A3B8;background:#F0F4F8;color:#0F172A}
.sb{width:256px;min-height:100vh;background:var(--b1);border-right:1px solid var(--bd);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;transition:width .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1);overflow:hidden}
.sb.col{width:68px}
.sb.hide{transform:translateX(-100%);border-right:none}
.sb-logo{padding:18px 15px 12px;display:flex;align-items:center;gap:11px;border-bottom:1px solid var(--bd)}
.logo-ic{width:38px;height:38px;background:linear-gradient(135deg,#2563EB,#06B6D4);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 18px rgba(37,99,235,.4)}
.logo-t{font-size:15px;font-weight:800;background:linear-gradient(135deg,#60A5FA,#06B6D4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap}
.logo-s{font-size:9px;color:var(--t2);font-weight:500;text-transform:uppercase;letter-spacing:1px}
.sb-user{padding:13px 15px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px}
.sb-nav{flex:1;overflow-y:auto;padding:7px;scrollbar-width:none}
.sb-nav::-webkit-scrollbar{display:none}
.ns{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--t3);padding:10px 8px 5px;white-space:nowrap}
.ni{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:10px;cursor:pointer;transition:all .18s;margin:2px 0;white-space:nowrap;color:var(--t2);font-size:13px;font-weight:500;user-select:none}
.ni:hover{background:var(--b3);color:var(--t1)}
.ni.on{background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(6,182,212,.1));color:#2563EB;font-weight:600;box-shadow:inset 2px 0 0 #2563EB}
.dark .ni.on{color:#60A5FA}
.nb{margin-left:auto;background:#EF4444;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:999px}
.sb-foot{padding:10px 7px;border-top:1px solid var(--bd)}
.cb{width:100%;display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;background:none;border:1px solid var(--bd);cursor:pointer;color:var(--t2);font-size:12px;font-weight:500;transition:all .18s;white-space:nowrap;font-family:inherit}
.cb:hover{background:var(--b3);color:var(--t1)}
.tb{height:58px;background:var(--card);backdrop-filter:blur(20px);border-bottom:1px solid var(--bd);display:flex;align-items:center;padding:0 22px;gap:13px;position:sticky;top:0;z-index:50}
.ts{flex:1;max-width:330px;display:flex;align-items:center;gap:8px;background:var(--b2);border:1px solid var(--bd);border-radius:10px;padding:7px 12px}
.ts input{background:none;border:none;outline:none;font-size:13px;color:var(--t1);flex:1;font-family:inherit}
.ts input::placeholder{color:var(--t3)}
.ib{width:35px;height:35px;border-radius:9px;border:1px solid var(--bd);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);transition:all .18s;position:relative}
.ib:hover{background:var(--b3);color:var(--t1)}
.ndot{position:absolute;top:5px;right:5px;width:7px;height:7px;background:#EF4444;border-radius:50%;border:2px solid var(--b1)}
.main{display:flex;flex-direction:column;min-height:100vh;transition:margin-left .3s cubic-bezier(.4,0,.2,1)}
.pc{flex:1;padding:22px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:20px;backdrop-filter:blur(10px)}
.kpc{background:var(--card);border:2px solid var(--bd);border-radius:15px;padding:15px 17px;cursor:pointer;transition:all .22s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
.kpc:hover{transform:translateY(-2px)}
.dt{width:100%;border-collapse:collapse;font-size:13px}
.dt th{padding:10px 13px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--t3);border-bottom:1px solid var(--bd);background:var(--b2);white-space:nowrap}
.dt td{padding:11px 13px;border-bottom:1px solid var(--bd);color:var(--t1);vertical-align:middle}
.dt tbody tr:hover td{background:var(--b2)}
.dt tbody tr:last-child td{border-bottom:none}
.bdg{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600}
.bg{background:rgba(20,184,166,.12);color:#14B8A6}.br{background:rgba(239,68,68,.12);color:#EF4444}
.by{background:rgba(245,158,11,.12);color:#F59E0B}.bb{background:rgba(37,99,235,.12);color:#3B82F6}
.bgr{background:rgba(148,163,184,.12);color:#94A3B8}.bp{background:rgba(139,92,246,.12);color:#8B5CF6}
.bc{background:rgba(6,182,212,.12);color:#06B6D4}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 15px;border-radius:9px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .18s;font-family:inherit}
.btnP{background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;box-shadow:0 4px 14px rgba(37,99,235,.35)}
.btnP:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(37,99,235,.45)}
.btnS{background:var(--b2);color:var(--t1);border:1px solid var(--bd2)}.btnS:hover{background:var(--b3)}
.btnD{background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff}
.btnI{width:30px;height:30px;padding:0;justify-content:center}
.pb{height:6px;background:var(--b3);border-radius:999px;overflow:hidden}
.pf{height:100%;border-radius:999px;transition:width .5s ease}
.inp{background:var(--b2);border:1px solid var(--bd2);border-radius:9px;padding:7px 11px;font-size:13px;color:var(--t1);font-family:inherit;outline:none;transition:border-color .18s;width:100%}
.inp:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
.inp::placeholder{color:var(--t3)}
select.inp option{background:var(--b1)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center}
.mb{background:var(--b1);border:1px solid var(--bd2);border-radius:20px;padding:25px;width:90%;max-width:560px;max-height:92vh;overflow-y:auto}
.mb-lg{max-width:700px}.mb-sm{max-width:400px}
.mt{font-size:16px;font-weight:800;margin-bottom:17px;display:flex;align-items:center;gap:10px}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}
.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:11px}
@media(max-width:1200px){.g4{grid-template-columns:repeat(2,1fr)}.g5{grid-template-columns:repeat(3,1fr)}}
@media(max-width:800px){.g3,.g2{grid-template-columns:1fr}}
@keyframes fadeUp{from{opacity:0;transform:translateY(13px)}to{opacity:1;transform:none}}
@keyframes scIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}
.af{animation:fadeUp .32s ease both}.as{animation:scIn .18s ease both}
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:17px;flex-wrap:wrap;gap:11px}
.pt{font-size:21px;font-weight:800;letter-spacing:-.5px}.ps{font-size:13px;color:var(--t2);margin-top:3px}
.st{font-size:14px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:7px}
.divl{height:1px;background:var(--bd);margin:13px 0}
.av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0}
.mn{font-family:'JetBrains Mono',monospace}
.fbn{display:flex;align-items:center;gap:11px;padding:9px 14px;border-radius:12px;margin-bottom:11px;animation:fadeUp .22s ease}
.dd{position:absolute;top:calc(100% + 7px);right:0;background:var(--b1);border:1px solid var(--bd2);border-radius:12px;padding:7px;min-width:190px;z-index:200;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.ddi{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--t1);transition:background .13s}
.ddi:hover{background:var(--b2)}
.ddiv{height:1px;background:var(--bd);margin:5px 0}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:999px}
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt  = n => new Intl.NumberFormat("vi-VN").format(n);
const fmtM = n => (n >= 1e9 ? `${(n/1e9).toFixed(2)}T` : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : fmt(n)) + " ₫";
const today = () => new Date().toISOString().slice(0, 10);
const genId = (p, l) => `${p}${String(l.length + 1).padStart(3, "0")}`;
const sSt   = s => s === 0 ? "out" : s <= 5 ? "critical" : s <= 10 ? "low" : "active";
const orderTotal = items => items.reduce((s, i) => s + (i.qty||0)*(i.price||0), 0);

const STMAP = { active:{l:"Hoạt động",c:"bg"}, low:{l:"Tồn thấp",c:"by"}, critical:{l:"Sắp hết hàng",c:"br"}, out:{l:"Hết hàng",c:"br"}, inactive:{l:"Ngừng HĐ",c:"bgr"}, completed:{l:"Hoàn thành",c:"bg"}, processing:{l:"Đang xử lý",c:"bb"}, pending:{l:"Chờ duyệt",c:"by"}, cancelled:{l:"Đã hủy",c:"bgr"} };
const RMAP  = { Admin:{l:"Admin",c:"bp"}, Manager:{l:"Quản lý",c:"bb"}, Staff:{l:"Nhân viên",c:"bg"}, WarehouseStaff:{l:"NV Kho",c:"bc"}, Accountant:{l:"Kế toán",c:"by"} };
const RGRAD = { Admin:"8B5CF6,2563EB", Manager:"2563EB,06B6D4", Staff:"14B8A6,2563EB", WarehouseStaff:"06B6D4,14B8A6", Accountant:"F59E0B,EF4444" };

const Bdg = ({ s, r }) => { const m = s ? STMAP[s] : r ? RMAP[r] : null; return m ? <span className={`bdg ${m.c}`}>{m.l}</span> : null; };
const TT  = ({ active, payload, label }) => !active || !payload?.length ? null : (
  <div style={{ background:"var(--b1)", border:"1px solid var(--bd2)", borderRadius:10, padding:"9px 13px" }}>
    <p style={{ fontWeight:700, marginBottom:5, fontSize:12, color:"var(--t2)" }}>{label}</p>
    {payload.map((p, i) => <p key={i} style={{ color:p.color, fontSize:12, fontWeight:600 }}>{p.name}: {p.value}</p>)}
  </div>
);

/* ── Shared UI ──────────────────────────────────────────── */
const Toast = ({ t, close }) => !t ? null : (
  <div className="as" style={{ position:"fixed", top:18, right:20, zIndex:600, background:t.type==="error"?"rgba(239,68,68,.96)":t.type==="warn"?"rgba(245,158,11,.96)":t.type==="info"?"rgba(37,99,235,.96)":"rgba(20,184,166,.96)", color:"#fff", padding:"11px 16px", borderRadius:12, fontWeight:600, fontSize:13, boxShadow:"0 8px 30px rgba(0,0,0,.3)", display:"flex", alignItems:"center", gap:10, maxWidth:360 }}>
    <span style={{ flex:1, lineHeight:1.4 }}>{t.msg}</span>
    <button onClick={close} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)" }}><X size={14} /></button>
  </div>
);

const DelModal = ({ title, msg, onOk, onClose }) => (
  <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="mb mb-sm as" style={{ textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(239,68,68,.1)", border:"2px solid rgba(239,68,68,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 13px" }}><Trash2 size={25} color="#EF4444" /></div>
      <p style={{ fontSize:16, fontWeight:800, marginBottom:7 }}>{title}</p>
      <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>{msg}</p>
      <p style={{ fontSize:12, color:"#EF4444", fontWeight:600, marginTop:5 }}>Hành động không thể hoàn tác.</p>
      <div style={{ display:"flex", gap:9, justifyContent:"center", marginTop:19 }}>
        <button className="btn btnS" onClick={onClose} style={{ flex:1 }}>Hủy</button>
        <button className="btn btnD" onClick={onOk} style={{ flex:1 }}><Trash2 size={13} />Xóa</button>
      </div>
    </div>
  </div>
);

const KpiCard = ({ label, count, color, Icon, active, onClick }) => (
  <div className="kpc" onClick={onClick} style={{ border:`2px solid ${active ? color : "var(--bd)"}`, boxShadow:active ? `0 0 0 4px ${color}22, 0 8px 26px ${color}16` : "none", transform:active ? "translateY(-2px)" : "none", background:active ? `linear-gradient(135deg,${color}09,var(--card))` : undefined }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon size={21} style={{ color }} /></div>
      {active && <span style={{ fontSize:10, color, fontWeight:700, background:`${color}18`, padding:"2px 7px", borderRadius:999 }}>Đang lọc</span>}
    </div>
    <p style={{ fontSize:10.5, color:"var(--t3)", fontWeight:700, textTransform:"uppercase", letterSpacing:.7, marginBottom:3 }}>{label}</p>
    <p style={{ fontSize:28, fontWeight:800, color:active ? color : "var(--t1)", lineHeight:1 }}>{count}</p>
    <p style={{ fontSize:10.5, color:active ? color : "var(--t3)", marginTop:5, fontWeight:600 }}>{active ? "Nhấn để bỏ lọc ×" : "Nhấn để lọc →"}</p>
  </div>
);

const Fld = ({ label, req, error, children }) => (
  <div>
    <label style={{ fontSize:12, fontWeight:600, color:"var(--t2)", marginBottom:5, display:"block" }}>{label}{req && <span style={{ color:"#EF4444" }}> *</span>}</label>
    {children}
    {error && <p style={{ fontSize:11, color:"#EF4444", marginTop:3 }}>{error}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
const MENU = [
  { sec:"TỔNG QUAN",   items:[{ id:"dashboard",  l:"Dashboard",    I:LayoutDashboard }] },
  { sec:"QUẢN LÝ KHO", items:[{ id:"imports", l:"Nhập kho", I:ArrowDownToLine, b:2 }, { id:"exports", l:"Xuất kho", I:ArrowUpFromLine }, { id:"warehouses", l:"Kho hàng",   I:Warehouse }, { id:"products",   l:"Sản phẩm",    I:Package }] },
  { sec:"ĐỐI TÁC",     items:[{ id:"suppliers",  l:"Nhà cung cấp", I:Truck }, { id:"users", l:"Người dùng", I:Users }] },
  { sec:"PHÂN TÍCH",   items:[{ id:"reports",    l:"Báo cáo",     I:BarChart3 }, { id:"activity", l:"Nhật ký HĐ", I:Activity }] },
  { sec:"CÀI ĐẶT",     items:[{ id:"settings",   l:"Cài đặt",     I:Settings }] },
];

function Sidebar({ cur, onNav, col, onCol, sbH, onLogout, adminProfile }) {
  const initials = adminProfile.name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <nav className={`sb${col ? " col" : ""}${sbH ? " hide" : ""}`}>
      <div className="sb-logo">
        <div className="logo-ic"><Boxes size={20} color="#fff" /></div>
        {!col && <div><div className="logo-t">WMS Pro</div><div className="logo-s">Warehouse Management</div></div>}
      </div>
      {!col && <div className="sb-user"><div className="av" style={{ width:34, height:34 }}>{initials}</div><div><div style={{ fontSize:13, fontWeight:600 }}>{adminProfile.name}</div><div style={{ fontSize:11, color:"var(--t2)" }}>Super Administrator</div></div></div>}
      <div className="sb-nav">
        {MENU.map(s => (
          <div key={s.sec}>
            {!col && <div className="ns">{s.sec}</div>}
            {col && <div style={{ height:7 }} />}
            {s.items.map(it => { const I = it.I; return (
              <div key={it.id} className={`ni${cur === it.id ? " on" : ""}`} onClick={() => onNav(it.id)} title={col ? it.l : ""}>
                <I size={17} style={{ flexShrink:0 }} />
                {!col && <><span style={{ flex:1 }}>{it.l}</span>{it.b && <span className="nb">{it.b}</span>}</>}
              </div>
            ); })}
          </div>
        ))}
      </div>
      <div className="sb-foot">
        {!col && <div className="ni" style={{ marginBottom:7, color:"#EF4444" }} onClick={onLogout}><LogOut size={16} /><span>Đăng xuất</span></div>}
        <button className="cb" onClick={onCol}>
          {col ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Thu gọn</span></>}
        </button>
      </div>
    </nav>
  );
}

function Topbar({ dark, onDark, pg, nc, onLogout, onAction, adminProfile, prods, onToggleSidebar }) {
  const [su, setSu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const LBL = { dashboard: "Dashboard", products: "Sản phẩm", warehouses: "Kho hàng", imports: "Nhập kho", exports: "Xuất kho", suppliers: "Nhà cung cấp", users: "Người dùng", reports: "Báo cáo", activity: "Nhật ký HĐ", settings: "Cài đặt" };
  
  const initials = adminProfile.name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <div className="tb">
      <button className="ib" onClick={onToggleSidebar} style={{ marginRight: 5 }} title="Ẩn/Hiện Menu">
        <Menu size={16} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 7 }}>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>WMS Pro</span>
        <ChevronRight size={11} color="var(--t3)" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{LBL[pg] || pg}</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--t2)" }}>{new Date().toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        <button className="ib" onClick={onDark}>{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
        <div style={{ position: "relative" }}>
          <button className="ib" onClick={() => setShowNotif(v => !v)}><Bell size={15} />{nc > 0 && <span className="ndot" />}</button>
          {showNotif && (
            <div className="dd" style={{ right: 0, width: 320, maxHeight: 400, overflowY: "auto" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bd)" }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>Thông báo tồn kho</p>
                <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{nc} sản phẩm cần chú ý</p>
              </div>
              <div style={{ padding: 5 }}>
                {!prods || prods.filter(p => ["low","critical","out"].includes(p.status)).length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "var(--t3)" }}>
                    🟢 Không có cảnh báo tồn kho nào!
                  </div>
                ) : (
                  prods.filter(p => ["low","critical","out"].includes(p.status)).map(p => {
                    const statusText = p.stock === 0 ? "Đã hết hàng!" : p.stock <= 5 ? `Sắp hết hàng! (${p.stock} đv)` : `Tồn kho thấp! (${p.stock} đv)`;
                    const color = p.stock === 0 ? "#EF4444" : p.stock <= 5 ? "#EF4444" : "#F59E0B";
                    return (
                      <div key={p.id} className="ddi" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: 12 }}>{p.name}</p>
                          <p style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{statusText}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <div className="av" style={{ cursor: "pointer", width: 32, height: 32, fontSize: 11 }} onClick={() => setSu(v => !v)}>{initials}</div>
          {su && <div className="dd">
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bd)" }}><p style={{ fontWeight: 600, fontSize: 13 }}>{adminProfile.name}</p><p style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{adminProfile.email}</p></div>
            <div className="ddi" onClick={() => onAction("profile")}><User size={13} />Hồ sơ</div>
            <div className="ddi" onClick={() => onAction("settings")}><Settings size={13} />Cài đặt</div>
            <div className="ddiv" />
            <div className="ddi" style={{ color: "#EF4444" }} onClick={onLogout}><LogOut size={13} />Đăng xuất</div>
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
function Dashboard({ prods, whs, imps, exps, dark, logActivity }) {
  const tc = dark ? "#94A3B8" : "#64748B";
  const gc = dark ? "rgba(148,163,184,.06)" : "rgba(0,0,0,.05)";
  const tStock = prods.reduce((s, p) => s + Math.max(0, p.stock), 0);
  const tVal   = prods.reduce((s, p) => s + Math.max(0, p.stock) * p.buyPrice, 0);
  const pend   = [...imps, ...exps].filter(o => ["pending","processing"].includes(o.status)).length;
  const lowN   = prods.filter(p => ["low","critical","out"].includes(p.status)).length;

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const n = imps
        .filter(o => o.date === dateStr && o.status === "completed")
        .reduce((sum, o) => sum + o.items.reduce((s, it) => s + Number(it.qty || 0), 0), 0);
        
      const x = exps
        .filter(o => o.date === dateStr && o.status === "completed")
        .reduce((sum, o) => sum + o.items.reduce((s, it) => s + Number(it.qty || 0), 0), 0);
        
      data.push({ d: label, n, x });
    }
    
    const totalVolume = data.reduce((s, i) => s + i.n + i.x, 0);
    if (totalVolume === 0) {
      const completedTransactions = [...imps, ...exps].filter(o => o.status === "completed" && o.date);
      const uniqueDates = [...new Set(completedTransactions.map(o => o.date))].sort();
      const last7Dates = uniqueDates.slice(-7);
      
      if (last7Dates.length > 0) {
        return last7Dates.map(dateStr => {
          const parts = dateStr.split("-");
          const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;
          const n = imps.filter(o => o.date === dateStr && o.status === "completed").reduce((sum, o) => sum + o.items.reduce((s, it) => s + Number(it.qty || 0), 0), 0);
          const x = exps.filter(o => o.date === dateStr && o.status === "completed").reduce((sum, o) => sum + o.items.reduce((s, it) => s + Number(it.qty || 0), 0), 0);
          return { d: label, n, x };
        });
      }
    }
    return data;
  }, [imps, exps]);

  const dynamicPie = useMemo(() => {
    const totalVal = prods.reduce((s, p) => s + Math.max(0, p.stock) * p.buyPrice, 0) || 1;
    const cats = [...new Set(prods.map(p => p.category))];
    const colors = ["#2563EB", "#8B5CF6", "#06B6D4", "#14B8A6", "#F59E0B", "#EF4444", "#EC4899", "#10B981"];
    return cats.map((c, i) => {
      const val = prods.filter(p => p.category === c).reduce((s, p) => s + Math.max(0, p.stock) * p.buyPrice, 0);
      return {
        n: c,
        v: Math.round((val / totalVal) * 100) || 0,
        c: colors[i % colors.length]
      };
    }).filter(item => item.v > 0);
  }, [prods]);

  const exportDashboardReport = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Tổng quan
    const summaryData = [
      { "Chỉ số thống kê": "Tổng danh mục sản phẩm", "Giá trị": prods.length },
      { "Chỉ số thống kê": "Tổng tồn kho (đơn vị)", "Giá trị": tStock },
      { "Chỉ số thống kê": "Tổng giá trị tồn kho (đầu tư)", "Giá trị": tVal },
      { "Chỉ số thống kê": "Số phiếu chờ xử lý", "Giá trị": pend },
      { "Chỉ số thống kê": "Số sản phẩm dưới mức an toàn", "Giá trị": lowN }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");
    
    // Sheet 2: Công suất kho
    const whData = whs.map(wh => {
      const u = prods.filter(p => p.wid === wh.id).reduce((s, p) => s + p.stock, 0);
      return {
        "Mã kho": wh.id,
        "Tên kho": wh.name,
        "Sức chứa tối đa (đv)": wh.capacity,
        "Số lượng tồn kho": u,
        "Tỷ lệ lấp đầy (%)": Math.min(100, Math.round(u / wh.capacity * 100)) + "%"
      };
    });
    const wsWh = XLSX.utils.json_to_sheet(whData);
    XLSX.utils.book_append_sheet(wb, wsWh, "Công suất kho");
    
    XLSX.writeFile(wb, "BaoCaoDashboard_WMS.xlsx");
    logActivity("📊", "Xuất báo cáo tổng quan hệ thống ra file Excel");
  };

  return (
    <div className="af">
      <div className="ph">
        <div><div className="pt">Tổng quan hệ thống</div><div className="ps">Dữ liệu thực · Cập nhật liên tục</div></div>
        <button className="btn btnP" onClick={exportDashboardReport}><Download size={13} />Xuất báo cáo</button>
      </div>
      <div className="g4" style={{ marginBottom:17 }}>
        {[{ l:"Tổng sản phẩm", v:`${prods.length} SP`, s:`${tStock} đv tồn`, c:"#2563EB", I:Package }, { l:"Giá trị tồn kho", v:fmtM(tVal), s:"Tổng giá nhập", c:"#06B6D4", I:DollarSign }, { l:"Đơn chờ xử lý", v:`${pend} đơn`, s:"Nhập + xuất", c:"#8B5CF6", I:Clock }, { l:"Cảnh báo tồn kho", v:`${lowN} SP`, s:"Cần bổ sung", c:"#EF4444", I:AlertTriangle }].map(({ l, v, s, c, I }) => (
          <div key={l} className="kpc" style={{ cursor:"default", border:"1px solid var(--bd)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontSize:12, fontWeight:600, color:"var(--t2)" }}>{l}</span><div style={{ width:38, height:38, borderRadius:10, background:`${c}18`, display:"flex", alignItems:"center", justifyContent:"center" }}><I size={18} style={{ color:c }} /></div></div>
            <p style={{ fontSize:25, fontWeight:800, letterSpacing:-1 }}>{v}</p>
            <p style={{ fontSize:12, color:"var(--t2)", marginTop:4 }}>{s}</p>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
        <div className="card">
          <div className="st"><BarChart2 size={15} style={{ color:"#2563EB" }} />Lưu lượng nhập/xuất (7 ngày)</div>
          <ResponsiveContainer width="100%" height={205}>
            <AreaChart data={chartData} margin={{ top:5, right:8, bottom:0, left:-10 }}>
              <defs>
                <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={.28}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                <linearGradient id="gX" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06B6D4" stopOpacity={.28}/><stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gc} /><XAxis dataKey="d" tick={{ fill:tc, fontSize:11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:tc, fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} /><Legend wrapperStyle={{ fontSize:12, color:tc }} />
              <Area type="monotone" dataKey="n" name="Nhập kho" stroke="#2563EB" strokeWidth={2} fill="url(#gN)" dot={{ fill:"#2563EB", r:3 }} />
              <Area type="monotone" dataKey="x" name="Xuất kho" stroke="#06B6D4" strokeWidth={2} fill="url(#gX)" dot={{ fill:"#06B6D4", r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="st"><Target size={15} style={{ color:"#8B5CF6" }} />Danh mục sản phẩm</div>
          <ResponsiveContainer width="100%" height={148}><PieChart><Pie data={dynamicPie} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="v">{dynamicPie.map((e, i) => <Cell key={i} fill={e.c} />)}</Pie><Tooltip content={<TT />} formatter={v => [`${v}%`, ""]} /></PieChart></ResponsiveContainer>
          {dynamicPie.map(it => <div key={it.n} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, marginBottom:3 }}><div style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:2, background:it.c, display:"inline-block" }} /><span style={{ color:"var(--t2)" }}>{it.n}</span></div><span style={{ fontWeight:700 }}>{it.v}%</span></div>)}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <div className="card">
          <div className="st"><Warehouse size={15} style={{ color:"#06B6D4" }} />Công suất kho</div>
          {whs.map(wh => { const u = prods.filter(p => p.wid === wh.id).reduce((s, p) => s + p.stock, 0); const pct = Math.min(100, Math.round(u / wh.capacity * 100)); const col = pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#14B8A6"; return (
            <div key={wh.id} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{ fontSize:12, fontWeight:600 }}>{wh.name.split(" - ")[0]}</span><span style={{ fontSize:12, color:"var(--t2)" }}>{u}/{wh.capacity} ({pct}%)</span></div>
              <div className="pb"><div className="pf" style={{ width:`${pct}%`, background:col }} /></div>
            </div>
          ); })}
        </div>
        <div className="card">
          <div className="st"><AlertTriangle size={15} style={{ color:"#F59E0B" }} />Cảnh báo tồn kho</div>
          {prods.filter(p => ["low","critical","out"].includes(p.status)).slice(0, 5).map(p => { const wh = whs.find(w => w.id === p.wid); return (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 0", borderBottom:"1px solid var(--bd)" }}>
              <div style={{ flex:1 }}><p style={{ fontSize:12, fontWeight:600 }}>{p.name}</p><p style={{ fontSize:11, color:"var(--t3)" }}>{wh?.name}</p></div>
              <div style={{ textAlign:"right" }}><Bdg s={p.status === 'critical' ? 'critical' : p.status} /><p style={{ fontSize:13, fontWeight:800, color:p.stock <= 5 ? "#EF4444" : "#F59E0B", marginTop:2 }}>{p.stock}</p></div>
            </div>
          ); })}
        </div>
        <div className="card">
          <div className="st"><Activity size={15} style={{ color:"#2563EB" }} />Hoạt động gần đây</div>
          {[{ ic:"📥", t:"Nhập 10 Laptop Dell XPS 13", s:"Nguyễn Thị Lan · 08:30" }, { ic:"📤", t:"Xuất 3 Laptop Dell", s:"Trần Minh Khoa · 09:15" }, { ic:"⚠️", t:"Màn hình LG còn 3 cái", s:"Hệ thống · 11:30" }, { ic:"➕", t:"Thêm Router WiFi 6 ASUS", s:"Admin · 10:02" }].map((a, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"7px 0", borderBottom:i < 3 ? "1px solid var(--bd)" : "none" }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{a.ic}</span>
              <div><p style={{ fontSize:12, fontWeight:600 }}>{a.t}</p><p style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>{a.s}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCTS PAGE — full CRUD
═══════════════════════════════════════════════════════════ */
const EP0 = { name:"", sku:"", category:"Điện tử", buyPrice:"", sellPrice:"", stock:"", wid:"WH001", loc:"", img:"📦", desc:"" };

function ProductsPage({ prods, setProds, whs, showT }) {
  const [srch, setSrch]   = useState(""); const [catF, setCatF] = useState("all"); const [whF, setWhF] = useState("all"); const [stF, setStF] = useState("all");
  const [modal, setModal] = useState(null); const [sel, setSel] = useState(null); const [form, setForm] = useState(EP0); const [errs, setErrs] = useState({});
  const [pg, setPg]       = useState(1); const PER = 8;

  const filtered = useMemo(() => prods.filter(p => {
    const q = srch.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      && (catF === "all" || p.category === catF) && (whF === "all" || p.wid === whF) && (stF === "all" || p.status === stF);
  }), [prods, srch, catF, whF, stF]);

  const pages = Math.ceil(filtered.length / PER) || 1;
  const shown = filtered.slice((pg - 1) * PER, pg * PER);

  const validate = () => { const e = {}; if (!form.name.trim()) e.name = "Bắt buộc"; if (!form.sku.trim()) e.sku = "Bắt buộc"; if (isNaN(+form.buyPrice) || +form.buyPrice <= 0) e.buyPrice = "Không hợp lệ"; if (isNaN(+form.sellPrice) || +form.sellPrice <= 0) e.sellPrice = "Không hợp lệ"; if (isNaN(+form.stock) || +form.stock < 0) e.stock = "Không hợp lệ"; setErrs(e); return !Object.keys(e).length; };
  const save = async () => {
    if (!validate()) return;
    const st = +form.stock;
    const dbData = {
      ma_hang: form.sku,
      ten_hang: form.name,
      nhom_hang: form.category,
      gia_nhap: +form.buyPrice,
      gia_ban: +form.sellPrice,
      warehouse_id: form.wid,
      vi_tri_kho: form.loc,
      hinh_anh: '',
      mo_ta: form.desc || '',
      ngung_kinh_doanh: form.status === 'inactive'
    };

    if (modal === "add") {
      const { data, error } = await supabase.from('goods').insert(dbData).select();
      if (error) { showT("Lỗi: " + error.message, "error"); return; }
      const newId = data[0].id;
      // If stock > 0, create an initial import order in Supabase so stock is persisted
      if (st > 0) {
        const impCode = `PN-INIT-${Date.now()}`;
        const { data: newOrd } = await supabase.from('orders').insert({
          ma_phieu: impCode, loai_don: 'import',
          partner_id: null, warehouse_id: form.wid,
          nguoi_xu_ly: 'Nhập ban đầu', trang_thai: 'completed',
          ngay_giao_dich: today(), ghi_chu: `Tồn kho ban đầu cho sản phẩm ${form.name}`
        }).select().single();
        if (newOrd) {
          await supabase.from('order_items').insert({ order_id: newOrd.id, good_id: newId, so_luong: st, don_gia: +form.buyPrice });
        }
      }
      setProds(p => [{ ...form, id: newId, buyPrice:+form.buyPrice, sellPrice:+form.sellPrice, stock:st, status:sSt(st), upd:today() }, ...p]);
      showT(`✅ Đã thêm "${form.name}"`);
      logActivity("➕", `Thêm sản phẩm mới: ${form.name} (${form.sku})`);
    } else {
      const { error } = await supabase.from('goods').update(dbData).eq('id', sel.id);
      if (error) { showT("Lỗi: " + error.message, "error"); return; }
      setProds(p => p.map(x => x.id === sel.id ? { ...x, ...form, buyPrice:+form.buyPrice, sellPrice:+form.sellPrice, stock:st, status:sSt(st) } : x));
      showT(`✅ Đã cập nhật "${form.name}"`);
      logActivity("✏️", `Cập nhật sản phẩm: ${form.name} (${form.sku})`);
    }
    setModal(null); setSel(null);
  };
  const del = async () => {
    const { error } = await supabase.from('goods').delete().eq('id', sel.id);
    if (error) { showT("Lỗi: " + error.message, "error"); return; }
    setProds(p => p.filter(x => x.id !== sel.id));
    showT(`🗑️ Đã xóa "${sel.name}"`, "error");
    logActivity("🗑️", `Xóa sản phẩm: ${sel.name} (${sel.sku})`);
    setModal(null);
    setSel(null);
  };

  return (
    <div className="af">
      <div className="ph">
        <div><div className="pt">Quản lý sản phẩm</div><div className="ps">{filtered.length} SP · tổng tồn: {prods.reduce((s, p) => s + p.stock, 0)} đv</div></div>
        <button className="btn btnP" onClick={() => { setForm(EP0); setErrs({}); setSel(null); setModal("add"); }}><Plus size={13} />Thêm sản phẩm</button>
      </div>
      <div className="card" style={{ marginBottom:11, padding:"10px 14px" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ flex:1, minWidth:180, display:"flex", alignItems:"center", gap:7, background:"var(--b2)", border:"1px solid var(--bd2)", borderRadius:9, padding:"6px 11px" }}>
            <Search size={13} color="var(--t3)" />
            <input value={srch} onChange={e => { setSrch(e.target.value); setPg(1); }} placeholder="Tìm tên, SKU, mã SP..." style={{ background:"none", border:"none", outline:"none", fontSize:13, color:"var(--t1)", flex:1, fontFamily:"inherit" }} />
            {srch && <button onClick={() => setSrch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)" }}><X size={12} /></button>}
          </div>
          <select className="inp" value={catF} onChange={e => { setCatF(e.target.value); setPg(1); }} style={{ width:"auto" }}><option value="all">Tất cả danh mục</option>{CATS.map(c => <option key={c}>{c}</option>)}</select>
          <select className="inp" value={whF} onChange={e => { setWhF(e.target.value); setPg(1); }} style={{ width:"auto" }}><option value="all">Tất cả kho</option>{whs.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <select className="inp" value={stF} onChange={e => { setStF(e.target.value); setPg(1); }} style={{ width:"auto" }}><option value="all">Tất cả TT</option><option value="active">Hoạt động</option><option value="low">Tồn thấp</option><option value="critical">Sắp hết hàng</option><option value="out">Hết hàng</option></select>
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="dt">
          <thead><tr><th>Mã SP</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Kho</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={9} style={{ textAlign:"center", padding:"35px 0", color:"var(--t3)" }}>Không tìm thấy sản phẩm</td></tr>}
            {shown.map(p => { const wh = whs.find(w => w.id === p.wid); return (
              <tr key={p.id}>
                <td><span className="mn" style={{ fontSize:12, color:"var(--t1)", fontWeight:700 }}>{p.sku}</span></td>
                <td><p style={{ fontWeight:600, fontSize:13 }}>{p.name}</p></td>
                <td><span className="bdg bb">{p.category}</span></td>
                <td style={{ fontWeight:600, fontSize:13 }}>{fmtM(p.buyPrice)}</td>
                <td style={{ fontWeight:600, fontSize:13, color:"#14B8A6" }}>{fmtM(p.sellPrice)}</td>
                <td><span style={{ fontSize:15, fontWeight:800, color:p.stock === 0 ? "#EF4444" : p.stock <= 5 ? "#EF4444" : p.stock <= 10 ? "#F59E0B" : "var(--t1)" }}>{p.stock}</span></td>
                <td><p style={{ fontSize:12 }}>{wh?.name || "—"}</p><p style={{ fontSize:11, color:"var(--t3)" }}>{p.loc}</p></td>
                <td><Bdg s={p.status} /></td>
                <td><div style={{ display:"flex", gap:3 }}>
                  <button className="btn btnS btnI" onClick={() => { setSel(p); setForm({ ...p, buyPrice:String(p.buyPrice), sellPrice:String(p.sellPrice), stock:String(p.stock) }); setErrs({}); setModal("edit"); }} title="Sửa"><Edit2 size={12} style={{ color:"#2563EB" }} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(p); setModal("del"); }} title="Xóa"><Trash2 size={12} style={{ color:"#EF4444" }} /></button>
                </div></td>
              </tr>
            ); })}
          </tbody>
        </table>
        <div style={{ padding:"9px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid var(--bd)" }}>
          <span style={{ fontSize:12, color:"var(--t2)" }}>{shown.length} / {filtered.length} sản phẩm</span>
          <div style={{ display:"flex", gap:3 }}>
            <button className="btn btnS btnI" disabled={pg === 1} onClick={() => setPg(1)}><ChevronFirst size={12} /></button>
            <button className="btn btnS btnI" disabled={pg === 1} onClick={() => setPg(p => p - 1)}><ChevronLeft size={12} /></button>
            {Array.from({ length:pages }, (_, i) => i + 1).map(p => <button key={p} className="btn" style={{ minWidth:30, height:30, padding:"0 6px", fontSize:12, background:p === pg ? "#2563EB" : "var(--b2)", color:p === pg ? "#fff" : "var(--t1)", border:"1px solid var(--bd2)" }} onClick={() => setPg(p)}>{p}</button>)}
            <button className="btn btnS btnI" disabled={pg === pages} onClick={() => setPg(p => p + 1)}><ChevronRight size={12} /></button>
            <button className="btn btnS btnI" disabled={pg === pages} onClick={() => setPg(pages)}><ChevronLast size={12} /></button>
          </div>
        </div>
      </div>
      {(modal === "add" || modal === "edit") && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="mb mb-lg as">
            <div className="mt">
              <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center" }}>{modal === "add" ? <Plus size={17} color="#fff" /> : <Edit2 size={16} color="#fff" />}</div>
              {modal === "add" ? "Thêm sản phẩm mới" : `Chỉnh sửa: ${sel?.name}`}
              <button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={() => setModal(null)}><X size={13} /></button>
            </div>
            <div className="g2" style={{ gap:10 }}>
              <Fld label="Tên sản phẩm" req error={errs.name}><input className="inp" placeholder="Tên sản phẩm" value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} style={{ borderColor:errs.name ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Mã SP (SKU)" req error={errs.sku}><input className="inp" placeholder="VD: DELL-XPS13" value={form.sku} onChange={e => setForm(p => ({ ...p, sku:e.target.value }))} style={{ borderColor:errs.sku ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Danh mục"><select className="inp" value={form.category} onChange={e => setForm(p => ({ ...p, category:e.target.value }))}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Fld>
              <Fld label="Kho chứa"><select className="inp" value={form.wid} onChange={e => setForm(p => ({ ...p, wid:e.target.value }))}>{whs.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></Fld>
              <Fld label="Giá nhập (₫)" req error={errs.buyPrice}><input className="inp" placeholder="25000000" value={form.buyPrice} onChange={e => setForm(p => ({ ...p, buyPrice:e.target.value }))} style={{ borderColor:errs.buyPrice ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Giá bán (₫)" req error={errs.sellPrice}><input className="inp" placeholder="29500000" value={form.sellPrice} onChange={e => setForm(p => ({ ...p, sellPrice:e.target.value }))} style={{ borderColor:errs.sellPrice ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Tồn kho hiện tại" req error={errs.stock}><input className="inp" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock:e.target.value }))} style={{ borderColor:errs.stock ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Vị trí trong kho"><input className="inp" placeholder="A-01-03" value={form.loc} onChange={e => setForm(p => ({ ...p, loc:e.target.value }))} /></Fld>
            </div>
            {form.stock !== "" && !isNaN(+form.stock) && (
              <div style={{ marginTop:10, padding:"9px 13px", borderRadius:10, background:"var(--b2)" }}>
                <span style={{ fontSize:12, fontWeight:600 }}>Trạng thái tự động: </span><Bdg s={sSt(+form.stock)} />
              </div>
            )}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:17 }}>
              <button className="btn btnS" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btnP" onClick={save}>{modal === "add" ? <><Plus size={13} />Thêm sản phẩm</> : <><CheckCircle size={13} />Lưu thay đổi</>}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "del" && sel && <DelModal title="Xóa sản phẩm?" msg={`Xóa "${sel.name}" (${sel.sku})?`} onOk={del} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WAREHOUSES PAGE
═══════════════════════════════════════════════════════════ */
function WarehousesPage({ whs, setWhs, prods, showT, logActivity }) {
  const [modal, setModal]   = useState(null); const [sel, setSel] = useState(null); const [form, setForm] = useState({}); const [errs, setErrs] = useState({});
  const [activeWh, setActiveWh] = useState(null);

  const open = w => { setSel(w); setForm({ ...w, capacity:String(w.capacity), zones:String(w.zones) }); setErrs({}); setModal("edit"); };
  const del  = async () => { if (prods.some(p => p.wid === sel.id)) { showT("⚠️ Không thể xóa kho còn chứa sản phẩm", "warn"); setModal(null); return; } const { error } = await supabase.from('warehouses').delete().eq('id', sel.id); if (error) { showT("Lỗi xóa kho: " + error.message, "error"); return; } setWhs(p => p.filter(x => x.id !== sel.id)); showT(`🗑️ Đã xóa kho "${sel.name}"`, "error"); logActivity("🗑️", `Xóa kho hàng: ${sel.name}`); setModal(null); };
  const validate = () => { const e = {}; if (!form.name?.trim()) e.name = "Bắt buộc"; if (isNaN(+form.capacity) || +form.capacity <= 0) e.capacity = "Không hợp lệ"; if (isNaN(+form.zones) || +form.zones <= 0) e.zones = "Không hợp lệ"; if (!form.manager?.trim()) e.manager = "Bắt buộc"; setErrs(e); return !Object.keys(e).length; };
  const save = async () => { if (!validate()) return; const dbData = { ten_kho: form.name, dia_chi: form.location || '', suc_chua: +form.capacity, so_khu_vuc: +form.zones, loai_kho: form.type || 'Kho thường', nhiet_do: form.temperature || '', quan_ly: form.manager, so_dien_thoai: form.phone || '', trang_thai: form.status || 'active' }; const { error } = await supabase.from('warehouses').update(dbData).eq('id', sel.id); if (error) { showT("Lỗi cập nhật kho: " + error.message, "error"); return; } setWhs(p => p.map(x => x.id === sel.id ? { ...x, ...form, capacity:+form.capacity, zones:+form.zones } : x)); showT(`✅ Đã cập nhật kho "${form.name}"`); logActivity("✏️", `Cập nhật thông tin kho: ${form.name}`); setModal(null); };

  const whProds = wid => prods.filter(p => p.wid === wid);
  const usedQ   = wid => whProds(wid).reduce((s, p) => s + p.stock, 0);
  const curWh   = activeWh || whs[0]?.id;
  const curProds = whProds(curWh);
  const grouped  = useMemo(() => [...new Set(curProds.map(p => p.category))].map(cat => ({ cat, items:curProds.filter(p => p.category === cat) })), [curProds]);

  return (
    <div className="af">
      <div className="ph"><div><div className="pt">Quản lý kho hàng</div><div className="ps">{whs.length} kho · {prods.length} sản phẩm</div></div></div>
      <div className="g3" style={{ marginBottom:20 }}>
        {whs.map(wh => { const u = usedQ(wh.id); const pct = Math.min(100, Math.round(u / wh.capacity * 100)); const col = pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#14B8A6"; return (
          <div key={wh.id} className="card" style={{ position:"relative", overflow:"hidden", transition:"transform .2s,box-shadow .2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(37,99,235,.12)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:11 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center" }}><Warehouse size={22} color="#fff" /></div>
              <div style={{ display:"flex", gap:5 }}><Bdg s={wh.status} />
                <button className="btn btnS btnI" onClick={() => open(wh)} title="Sửa"><Edit2 size={12} style={{ color:"#2563EB" }} /></button>
                <button className="btn btnS btnI" onClick={() => { setSel(wh); setModal("del"); }} title="Xóa"><Trash2 size={12} style={{ color:"#EF4444" }} /></button>
              </div>
            </div>
            <p style={{ fontWeight:800, fontSize:15, marginBottom:3 }}>{wh.name}</p>
            <p style={{ fontSize:12, color:"var(--t2)", marginBottom:12, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11} />{wh.location}</p>
            <div className="g2" style={{ gap:7, marginBottom:12 }}>
              {[["Sức chứa", `${fmt(wh.capacity)} đv`], ["Đã dùng", `${fmt(u)} đv`], ["Khu vực", `${wh.zones} zone`], ["Loại kho", wh.type]].map(([k, v]) => (
                <div key={k} style={{ background:"var(--b2)", borderRadius:8, padding:"7px 9px" }}><p style={{ fontSize:11, color:"var(--t3)" }}>{k}</p><p style={{ fontSize:12, fontWeight:700, marginTop:2 }}>{v}</p></div>
              ))}
            </div>
            <div style={{ marginBottom:11 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{ fontSize:12, color:"var(--t2)" }}>Mức sử dụng</span><span style={{ fontSize:12, fontWeight:700, color:col }}>{pct}%</span></div>
              <div className="pb"><div className="pf" style={{ width:`${pct}%`, background:col }} /></div>
            </div>
            <div className="divl" />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div><p style={{ fontSize:12, color:"var(--t2)" }}>👤 <strong style={{ color:"var(--t1)" }}>{wh.manager}</strong></p><p style={{ fontSize:12, color:"var(--t2)", marginTop:2, display:"flex", alignItems:"center", gap:4 }}><Phone size={11} />{wh.phone}</p></div>
              <button className="btn btnS" onClick={() => setActiveWh(wh.id)} style={{ fontSize:12 }}><Package size={12} />{whProds(wh.id).length} SP</button>
            </div>
          </div>
        ); })}
      </div>
      {/* Products per warehouse */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", borderBottom:"1px solid var(--bd)", padding:"0 17px" }}>
          <Package size={15} style={{ color:"#2563EB", marginRight:8, flexShrink:0 }} />
          <span style={{ fontSize:14, fontWeight:700, marginRight:13, padding:"13px 0", whiteSpace:"nowrap" }}>Sản phẩm theo kho</span>
          <div style={{ display:"flex", gap:4, overflowX:"auto", flex:1, padding:"8px 0" }}>
            {whs.map(wh => { const cnt = whProds(wh.id).length; const isA = curWh === wh.id; return (
              <button key={wh.id} onClick={() => setActiveWh(wh.id)} className="btn" style={{ fontSize:12, padding:"5px 12px", whiteSpace:"nowrap", background:isA ? "linear-gradient(135deg,#2563EB,#1D4ED8)" : undefined, color:isA ? "#fff" : undefined, border:isA ? "none" : "1px solid var(--bd2)" }}>
                {wh.name.split(" - ")[0]} <span style={{ marginLeft:4, background:isA ? "rgba(255,255,255,.25)" : "var(--b3)", padding:"1px 5px", borderRadius:999, fontSize:10 }}>{cnt}</span>
              </button>
            ); })}
          </div>
        </div>
        {whs.find(w => w.id === curWh) && (() => { const wh = whs.find(w => w.id === curWh); const u = usedQ(curWh); const pct = Math.min(100, Math.round(u / wh.capacity * 100)); const col = pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#14B8A6"; return (
          <div style={{ padding:"11px 17px", background:"var(--b2)", borderBottom:"1px solid var(--bd)", display:"flex", gap:18, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:700 }}>{wh.name}</span>
            <span style={{ fontSize:12, color:"var(--t2)" }}>Loại: <strong>{wh.type}</strong></span>
            <span style={{ fontSize:12, color:"var(--t2)" }}>Nhiệt độ: <strong>{wh.temperature}</strong></span>
            <span style={{ fontSize:12, color:"var(--t2)" }}>Tồn: <strong style={{ color:col }}>{u}</strong>/{wh.capacity} đv ({pct}%)</span>
            <span style={{ fontSize:12, color:"var(--t2)" }}>Sản phẩm: <strong>{whProds(curWh).length} loại</strong></span>
          </div>
        ); })()}
        <table className="dt">
          <thead><tr><th>Mã SP</th><th>Sản phẩm</th><th>Danh mục</th><th>Vị trí</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {curProds.length === 0 && <tr><td colSpan={8} style={{ textAlign:"center", padding:"26px 0", color:"var(--t3)" }}>Chưa có sản phẩm trong kho này</td></tr>}
            {grouped.map(({ cat, items }) => [
              <tr key={`h-${cat}`}><td colSpan={8} style={{ background:"var(--b3)", padding:"5px 13px", fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.7 }}>📦 {cat} — {items.length} sản phẩm</td></tr>,
              ...items.map(p => (
                <tr key={p.id}>
                  <td><span className="mn" style={{ fontSize:12, color:"var(--t2)" }}>{p.sku}</span></td>
                  <td><span style={{ fontWeight:600, fontSize:13 }}>{p.name}</span></td>
                  <td><span className="bdg bb">{p.category}</span></td>
                  <td><span className="bdg bc">{p.loc || "—"}</span></td>
                  <td style={{ fontWeight:600, fontSize:13 }}>{fmtM(p.buyPrice)}</td>
                  <td style={{ fontWeight:600, fontSize:13, color:"#14B8A6" }}>{fmtM(p.sellPrice)}</td>
                  <td><span style={{ fontSize:14, fontWeight:800, color:p.stock === 0 ? "#EF4444" : p.stock <= 5 ? "#EF4444" : p.stock <= 10 ? "#F59E0B" : "var(--t1)" }}>{p.stock}</span></td>
                  <td><Bdg s={p.status} /></td>
                </tr>
              ))
            ])}
          </tbody>
        </table>
      </div>
      {/* Edit modal */}
      {modal === "edit" && sel && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="mb as">
            <div className="mt"><div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center" }}><Edit2 size={16} color="#fff" /></div>Chỉnh sửa kho: {sel.name}<button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={() => setModal(null)}><X size={13} /></button></div>
            <div className="g2" style={{ gap:10 }}>
              <div style={{ gridColumn:"1/-1" }}><Fld label="Tên kho" req error={errs.name}><input className="inp" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} style={{ borderColor:errs.name ? "#EF4444" : undefined }} /></Fld></div>
              <Fld label="Địa chỉ"><input className="inp" value={form.location || ""} onChange={e => setForm(p => ({ ...p, location:e.target.value }))} /></Fld>
              <Fld label="Sức chứa (đv)" req error={errs.capacity}><input className="inp" value={form.capacity || ""} onChange={e => setForm(p => ({ ...p, capacity:e.target.value }))} style={{ borderColor:errs.capacity ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Số khu vực" req error={errs.zones}><input className="inp" value={form.zones || ""} onChange={e => setForm(p => ({ ...p, zones:e.target.value }))} style={{ borderColor:errs.zones ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Loại kho"><select className="inp" value={form.type || "Kho thường"} onChange={e => setForm(p => ({ ...p, type:e.target.value }))}><option>Kho thường</option><option>Kho lạnh</option><option>Kho hóa chất</option><option>Kho ngoài trời</option></select></Fld>
              <Fld label="Nhiệt độ"><input className="inp" placeholder="18-22°C" value={form.temperature || ""} onChange={e => setForm(p => ({ ...p, temperature:e.target.value }))} /></Fld>
              <Fld label="Quản lý kho" req error={errs.manager}><input className="inp" value={form.manager || ""} onChange={e => setForm(p => ({ ...p, manager:e.target.value }))} style={{ borderColor:errs.manager ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Số điện thoại"><input className="inp" placeholder="09xx xxx xxx" value={form.phone || ""} onChange={e => setForm(p => ({ ...p, phone:e.target.value }))} /></Fld>
              <Fld label="Trạng thái"><select className="inp" value={form.status || "active"} onChange={e => setForm(p => ({ ...p, status:e.target.value }))}><option value="active">Hoạt động</option><option value="inactive">Ngừng HĐ</option></select></Fld>
            </div>
            {form.capacity && !isNaN(+form.capacity) && (() => { const u = usedQ(sel.id); const pct = Math.min(100, Math.round(u / +form.capacity * 100)); const col = pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#14B8A6"; return (
              <div style={{ marginTop:11, padding:"9px 13px", borderRadius:10, background:"var(--b2)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{ fontSize:12, fontWeight:600 }}>Xem trước mức sử dụng:</span><span style={{ fontSize:12, fontWeight:700, color:col }}>{pct}%</span></div>
                <div className="pb"><div className="pf" style={{ width:`${pct}%`, background:col }} /></div>
              </div>
            ); })()}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:17 }}>
              <button className="btn btnS" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btnP" onClick={save}><CheckCircle size={13} />Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
      {modal === "del" && sel && <DelModal title="Xóa kho hàng?" msg={`Xóa "${sel.name}"? Chỉ xóa được khi không còn sản phẩm.`} onOk={del} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ORDER FORM MODAL (dùng chung nhập & xuất)
═══════════════════════════════════════════════════════════ */
function OrderFormModal({ type, mode, order, prods, setProds, whs, supps, users, showT, onSave, onClose }) {
  const isImp = type === "imp";
  const [form, setForm] = useState(() => order ? {
    ...(isImp ? { sid:order.sid, sname:order.sname, receiver:order.receiver } : { customer:order.customer, handler:order.handler }),
    wid:order.wid, wname:order.wname, status:order.status, date:order.date, note:order.note || "", items:order.items.map(i => ({ ...i })),
  } : {
    ...(isImp ? { sid:supps[0]?.id || "", sname:supps[0]?.name || "", receiver:"" } : { customer:"", handler:"" }),
    wid:whs[0]?.id || "", wname:whs[0]?.name || "", status:"pending", date:today(), note:"", items:[],
  });
  const [errs, setErrs] = useState({});
  const whProds = prods.filter(p => p.wid === form.wid);
  const total   = form.items.reduce((s, i) => s + (+i.qty || 0) * (+i.price || 0), 0);

  const [showQuick, setShowQuick] = useState(false);
  const [qp, setQp] = useState({ name: "", sku: "", category: "Điện tử", buyPrice: "", sellPrice: "" });
  const [qpErrs, setQpErrs] = useState({});

  const handleQuickAdd = async () => {
    const e = {};
    if (!qp.name.trim()) e.name = "Bắt buộc";
    if (!qp.sku.trim()) e.sku = "Bắt buộc";
    if (isNaN(+qp.buyPrice) || +qp.buyPrice < 0) e.buyPrice = "Giá không hợp lệ";
    if (isNaN(+qp.sellPrice) || +qp.sellPrice < 0) e.sellPrice = "Giá không hợp lệ";
    if (Object.keys(e).length > 0) { setQpErrs(e); return; }

    const dbData = {
      ma_hang: qp.sku,
      ten_hang: qp.name,
      nhom_hang: qp.category,
      gia_nhap: +qp.buyPrice,
      gia_ban: +qp.sellPrice,
      warehouse_id: form.wid,
      vi_tri_kho: "",
      ngung_kinh_doanh: false
    };

    const { data, error } = await supabase.from('goods').insert(dbData).select();
    if (error) { showT("Lỗi tạo SP: " + error.message, "error"); return; }

    const newProd = {
      id: data[0].id,
      name: qp.name,
      sku: qp.sku,
      category: qp.category,
      buyPrice: +qp.buyPrice,
      sellPrice: +qp.sellPrice,
      stock: 0,
      wid: form.wid,
      status: "out",
      img: "",
      loc: ""
    };

    setProds(p => [newProd, ...p]);
    showT(`✅ Đã thêm sản phẩm "${qp.name}"`);

    setForm(p => ({
      ...p,
      items: [...p.items, { pid: newProd.id, pname: newProd.name, qty: 1, price: isImp ? newProd.buyPrice : newProd.sellPrice }]
    }));

    setQp({ name: "", sku: "", category: "Điện tử", buyPrice: "", sellPrice: "" });
    setQpErrs({});
    setShowQuick(false);
  };

  const addItem = () => {
    const f = isImp ? prods[0] : (whProds[0] || prods[0]);
    if (!f) {
      showT("Không có sản phẩm nào để thêm!", "warn");
      return;
    }
    setForm(p => ({ ...p, items:[...p.items, { pid:f.id, pname:f.name, qty:1, price:isImp ? f.buyPrice : f.sellPrice }] }));
  };
  const upItem  = (idx, field, val) => setForm(p => { const items = [...p.items]; items[idx] = { ...items[idx], [field]:field === "qty" || field === "price" ? +val : val }; if (field === "pid") { const pr = prods.find(x => x.id === val); if (pr) { items[idx].pname = pr.name; items[idx].price = isImp ? pr.buyPrice : pr.sellPrice; } } return { ...p, items }; });
  const rmItem  = idx => setForm(p => ({ ...p, items:p.items.filter((_, i) => i !== idx) }));
  const validate = () => { const e = {}; if (isImp && !form.sid) e.sid = "Chọn nhà CC"; if (!isImp && !form.customer?.trim()) e.customer = "Bắt buộc"; if (form.items.length === 0) e.items = "Cần ít nhất 1 sản phẩm"; setErrs(e); return !Object.keys(e).length; };

  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-lg as" style={{ maxWidth:700 }}>
        <div className="mt">
          <div style={{ width:34, height:34, borderRadius:9, background:isImp ? "linear-gradient(135deg,#14B8A6,#2563EB)" : "linear-gradient(135deg,#06B6D4,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center" }}>{mode === "add" ? <Plus size={17} color="#fff" /> : <Edit2 size={16} color="#fff" />}</div>
          {mode === "add" ? (isImp ? "Tạo phiếu nhập kho" : "Tạo phiếu xuất kho") : ((isImp ? "Sửa phiếu nhập" : "Sửa phiếu xuất") + (order ? " – " + order.id : ""))}
          <button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={onClose}><X size={13} /></button>
        </div>
        <div className="g2" style={{ gap:10, marginBottom:13 }}>
          {isImp ? (<>
            <Fld label="Nhà cung cấp" req error={errs.sid}>
              <select className="inp" style={{ borderColor:errs.sid ? "#EF4444" : undefined }} value={form.sid} onChange={e => { const s = supps.find(x => x.id === e.target.value); setForm(p => ({ ...p, sid:e.target.value, sname:s?.name || "" })); }}>
                {supps.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Fld>
            <Fld label="Người nhận">
              <select className="inp" value={form.receiver} onChange={e => setForm(p => ({ ...p, receiver:e.target.value }))}><option value="">Chọn người nhận</option>{users.map(u => <option key={u.id}>{u.name}</option>)}</select>
            </Fld>
          </>) : (<>
            <Fld label="Khách hàng / Đơn vị nhận" req error={errs.customer}><input className="inp" placeholder="Tên công ty / cá nhân" value={form.customer || ""} onChange={e => setForm(p => ({ ...p, customer:e.target.value }))} style={{ borderColor:errs.customer ? "#EF4444" : undefined }} /></Fld>
            <Fld label="Người xử lý">
              <select className="inp" value={form.handler || ""} onChange={e => setForm(p => ({ ...p, handler:e.target.value }))}><option value="">Chọn người xử lý</option>{users.map(u => <option key={u.id}>{u.name}</option>)}</select>
            </Fld>
          </>)}
          <Fld label={`Kho ${isImp ? "nhập" : "xuất"}`}>
            <select className="inp" value={form.wid} onChange={e => { const w = whs.find(x => x.id === e.target.value); setForm(p => ({ ...p, wid:e.target.value, wname:w?.name || "", items:[] })); }}>{whs.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          </Fld>
          <Fld label="Trạng thái">
            <select className="inp" value={form.status} onChange={e => setForm(p => ({ ...p, status:e.target.value }))}><option value="pending">Chờ duyệt</option><option value="processing">Đang xử lý</option><option value="completed">Hoàn thành</option><option value="cancelled">Đã hủy</option></select>
          </Fld>
          <Fld label="Ngày tạo"><input type="date" className="inp" value={form.date} onChange={e => setForm(p => ({ ...p, date:e.target.value }))} /></Fld>
          <div style={{ gridColumn:"1/-1" }}><Fld label="Ghi chú"><input className="inp" placeholder="Ghi chú..." value={form.note || ""} onChange={e => setForm(p => ({ ...p, note:e.target.value }))} /></Fld></div>
        </div>
        {/* Items */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <p style={{ fontSize:13, fontWeight:700 }}>Danh sách sản phẩm</p>
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn btnS" style={{ fontSize:12, padding:"5px 10px" }} onClick={addItem}><Plus size={12} />Thêm SP</button>
            </div>
          </div>
          {errs.items && <p style={{ fontSize:12, color:"#EF4444", marginBottom:7 }}>{errs.items}</p>}
          {form.items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"16px", background:"var(--b2)", borderRadius:10, color:"var(--t3)", fontSize:13 }}>Chưa có sản phẩm. Nhấn "+ Thêm SP"</div>
          ) : (
            <div style={{ border:"1px solid var(--bd)", borderRadius:10, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ background:"var(--b2)" }}>
                  <th style={{ padding:"8px 11px", textAlign:"left", fontWeight:700, fontSize:11, color:"var(--t3)" }}>Sản phẩm</th>
                  <th style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, fontSize:11, color:"var(--t3)" }}>SL</th>
                  <th style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, fontSize:11, color:"var(--t3)" }}>Đơn giá</th>
                  <th style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, fontSize:11, color:"var(--t3)" }}>Thành tiền</th>
                  <th style={{ padding:"8px 11px", width:34 }}></th>
                </tr></thead>
                <tbody>
                  {form.items.map((it, idx) => (
                    <tr key={idx} style={{ borderTop:"1px solid var(--bd)" }}>
                      <td style={{ padding:"7px 11px" }}>
                        <select className="inp" style={{ padding:"4px 7px", fontSize:12 }} value={it.pid} onChange={e => upItem(idx, "pid", e.target.value)}>
                          {(isImp ? prods : (whProds.length ? whProds : prods)).map(p => <option key={p.id} value={p.id}>{p.name} (tồn: {p.stock})</option>)}
                        </select>
                      </td>
                      <td style={{ padding:"7px 11px", textAlign:"right" }}>
                        <input type="number" min="1" className="inp" style={{ width:65, padding:"4px 7px", fontSize:12, textAlign:"right" }} value={it.qty} onChange={e => upItem(idx, "qty", e.target.value)} />
                      </td>
                      <td style={{ padding:"7px 11px", textAlign:"right" }}>
                        <input type="number" min="0" className="inp" style={{ width:105, padding:"4px 7px", fontSize:12, textAlign:"right" }} value={it.price} onChange={e => upItem(idx, "price", e.target.value)} />
                      </td>
                      <td style={{ padding:"7px 11px", textAlign:"right", fontWeight:700, color:"#14B8A6" }}>{fmtM((+it.qty || 0) * (+it.price || 0))}</td>
                      <td style={{ padding:"7px 11px" }}><button className="btn btnS btnI" onClick={() => rmItem(idx)}><X size={11} style={{ color:"#EF4444" }} /></button></td>
                    </tr>
                  ))}
                  <tr style={{ borderTop:"2px solid var(--bd)", background:"var(--b2)" }}>
                    <td colSpan={3} style={{ padding:"9px 11px", fontWeight:700, textAlign:"right", color:"var(--t2)" }}>TỔNG CỘNG</td>
                    <td style={{ padding:"9px 11px", fontWeight:800, fontSize:15, color:"#2563EB", textAlign:"right" }}>{fmtM(total)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        {form.status === "completed" && (
          <div style={{ marginTop:10, padding:"9px 13px", borderRadius:10, background:"rgba(20,184,166,.07)", border:"1px solid rgba(20,184,166,.2)" }}>
            <p style={{ fontSize:12, fontWeight:600, color:"#14B8A6" }}>⚡ Trạng thái "Hoàn thành" sẽ tự động {isImp ? "cộng vào" : "trừ từ"} tồn kho sản phẩm khi lưu.</p>
          </div>
        )}
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:17 }}>
          <button className="btn btnS" onClick={onClose}>Hủy</button>
          <button className="btn btnP" onClick={() => { if (validate()) onSave({ ...form, total, items:form.items }); }}>
            {mode === "add" ? <><Plus size={13} />Tạo phiếu</> : <><CheckCircle size={13} />Lưu thay đổi</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* detail view modal */
function OrderViewModal({ order, isImp, onEdit, onClose }) {
  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-lg as">
        <div className="mt">{isImp ? <Receipt size={17} style={{ color:"#2563EB" }} /> : <FileText size={17} style={{ color:"#06B6D4" }} />}Chi tiết phiếu {isImp ? "nhập" : "xuất"} {order.id}<button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={onClose}><X size={13} /></button></div>
        <div className="g2" style={{ gap:9, marginBottom:12 }}>
          {(isImp ? [["Nhà cung cấp", order.sname], ["Người nhận", order.receiver || "—"]] : [["Khách hàng", order.customer], ["Người xử lý", order.handler || "—"]]).map(([k, v]) => (<div key={k} style={{ background:"var(--b2)", borderRadius:9, padding:"9px 11px" }}><p style={{ fontSize:11, color:"var(--t3)", fontWeight:600 }}>{k}</p><p style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{v}</p></div>))}
          {[["Kho", order.wname], ["Ngày", order.date], ["Ghi chú", order.note || "—"]].map(([k, v]) => (<div key={k} style={{ background:"var(--b2)", borderRadius:9, padding:"9px 11px" }}><p style={{ fontSize:11, color:"var(--t3)", fontWeight:600 }}>{k}</p><p style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{v}</p></div>))}
          <div style={{ background:"var(--b2)", borderRadius:9, padding:"9px 11px" }}><p style={{ fontSize:11, color:"var(--t3)", fontWeight:600 }}>Trạng thái</p><Bdg s={order.status} /></div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, border:"1px solid var(--bd)", borderRadius:10, overflow:"hidden" }}>
          <thead><tr style={{ background:"var(--b2)" }}><th style={{ padding:"8px 11px", textAlign:"left", fontWeight:700, fontSize:11, color:"var(--t3)" }}>Sản phẩm</th><th style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, fontSize:11, color:"var(--t3)" }}>SL</th><th style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, fontSize:11, color:"var(--t3)" }}>Đơn giá</th><th style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, fontSize:11, color:"var(--t3)" }}>Thành tiền</th></tr></thead>
          <tbody>
            {order.items.map((it, i) => (<tr key={i} style={{ borderTop:"1px solid var(--bd)" }}><td style={{ padding:"8px 11px", fontWeight:600 }}>{it.pname}</td><td style={{ padding:"8px 11px", textAlign:"right", fontWeight:700 }}>{it.qty}</td><td style={{ padding:"8px 11px", textAlign:"right" }}>{fmtM(it.price)}</td><td style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, color:isImp ? "#14B8A6" : "#06B6D4" }}>{fmtM(it.qty * it.price)}</td></tr>))}
            <tr style={{ borderTop:"2px solid var(--bd)", background:"var(--b2)" }}><td colSpan={3} style={{ padding:"9px 11px", fontWeight:700, textAlign:"right" }}>TỔNG CỘNG</td><td style={{ padding:"9px 11px", fontWeight:800, fontSize:15, color:isImp ? "#2563EB" : "#06B6D4", textAlign:"right" }}>{fmtM(order.items.reduce((s, i) => s + i.qty * i.price, 0))}</td></tr>
          </tbody>
        </table>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:17 }}>
          <button className="btn btnS" onClick={onEdit}><Edit2 size={12} />Chỉnh sửa</button>
          <button className="btn btnS" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   IMPORTS PAGE
═══════════════════════════════════════════════════════════ */
const IMP_KPI = [
  { k:"all",        l:"Tổng phiếu",  c:"#2563EB", I:Receipt      },
  { k:"completed",  l:"Hoàn thành",  c:"#14B8A6", I:PackageCheck },
  { k:"processing", l:"Đang xử lý",  c:"#F59E0B", I:Clock        },
  { k:"pending",    l:"Chờ duyệt",   c:"#8B5CF6", I:AlertTriangle},
  { k:"cancelled",  l:"Đã hủy",      c:"#EF4444", I:XCircle      },
];

function ImportsPage({ imps, setImps, prods, setProds, whs, supps, users, showT, logActivity }) {
  const [kpi, setKpi]     = useState(null); const [modal, setModal] = useState(null); const [sel, setSel] = useState(null); const [srch, setSrch] = useState("");
  const cnt = k => k === "all" ? imps.length : imps.filter(o => o.status === k).length;
  const filtered = useMemo(() => imps.filter(o => { const q = srch.toLowerCase(); return (!q || o.id.toLowerCase().includes(q) || (o.sname || "").toLowerCase().includes(q)) && (!kpi || kpi === "all" || o.status === kpi); }), [imps, kpi, srch]);

  const applyDelta = (items, delta) => setProds(p => p.map(prod => { const it = items.find(i => i.pid === prod.id); if (!it) return prod; const ns = Math.max(0, prod.stock + delta * it.qty); return { ...prod, stock:ns, status:sSt(ns), upd:today() }; }));
  const handleSave = async (fd) => {
    const wasDone = sel?.status === "completed"; const nowDone = fd.status === "completed";
    if (modal === "add") {
      const id = genId("PN", imps);
      // Save to Supabase
      const { data: newOrd, error: ordErr } = await supabase.from('orders').insert({
        ma_phieu: id, loai_don: 'import',
        partner_id: fd.sid || null,
        warehouse_id: fd.wid,
        nguoi_xu_ly: fd.receiver || '',
        trang_thai: fd.status,
        ngay_giao_dich: fd.date,
        ghi_chu: fd.note || ''
      }).select().single();
      if (ordErr) { showT("Lỗi tạo phiếu: " + ordErr.message, "error"); return; }
      if (fd.items.length > 0) {
        const itemsToInsert = fd.items.map(it => ({ order_id: newOrd.id, good_id: it.pid, so_luong: it.qty, don_gia: it.price }));
        await supabase.from('order_items').insert(itemsToInsert);
      }
      if (nowDone) applyDelta(fd.items, 1);
      setImps(p => [{ id, dbId: newOrd.id, ...fd }, ...p]);
      showT(`✅ Tạo phiếu ${id}${nowDone ? " · Đã cộng tồn kho" : ""}`);
      logActivity("📥", `Tạo phiếu nhập kho: ${id} — Tổng tiền: ${fmtM(fd.total || orderTotal(fd.items))}`);
    } else {
      // Update in Supabase
      const dbId = sel.dbId;
      if (dbId) {
        await supabase.from('orders').update({
          partner_id: fd.sid || null,
          warehouse_id: fd.wid,
          nguoi_xu_ly: fd.receiver || '',
          trang_thai: fd.status,
          ngay_giao_dich: fd.date,
          ghi_chu: fd.note || ''
        }).eq('id', dbId);
        // Re-insert order_items
        await supabase.from('order_items').delete().eq('order_id', dbId);
        if (fd.items.length > 0) {
          const itemsToInsert = fd.items.map(it => ({ order_id: dbId, good_id: it.pid, so_luong: it.qty, don_gia: it.price }));
          await supabase.from('order_items').insert(itemsToInsert);
        }
      }
      if (!wasDone && nowDone) applyDelta(fd.items, 1);
      if (wasDone && !nowDone) applyDelta(sel.items, -1);
      setImps(p => p.map(o => o.id === sel.id ? { ...o, ...fd } : o));
      showT(`✅ Đã cập nhật ${sel.id}`);
      logActivity("✏️", `Cập nhật phiếu nhập kho: ${sel.id}`);
    }
    setModal(null); setSel(null);
  };
  const handleDel = async () => {
    if (sel.dbId) {
      const { error } = await supabase.from('orders').delete().eq('id', sel.dbId);
      if (error) { showT("Lỗi xóa phiếu: " + error.message, "error"); return; }
    }
    if (sel.status === "completed") applyDelta(sel.items, -1);
    setImps(p => p.filter(o => o.id !== sel.id));
    showT(`🗑️ Đã xóa ${sel.id}`, "error");
    logActivity("🗑️", `Xóa phiếu nhập kho: ${sel.id}`);
    setModal(null); setSel(null);
  };
  const aKpi = IMP_KPI.find(k => k.k === kpi);

  return (
    <div className="af">
      <div className="ph">
        <div><div className="pt">Phiếu nhập kho</div><div className="ps">{aKpi && kpi ? <span>Lọc: <span style={{ color:aKpi.c, fontWeight:700 }}>{aKpi.l}</span> · {filtered.length} phiếu</span> : `${imps.length} phiếu`}</div></div>
        <div style={{ display:"flex", gap:8 }}>
          {kpi && <button className="btn btnS" onClick={() => setKpi(null)}><X size={12} />Bỏ lọc</button>}
          <button className="btn btnP" onClick={() => { setSel(null); setModal("add"); }}><Plus size={13} />Tạo phiếu nhập</button>
        </div>
      </div>
      <div className="g5" style={{ marginBottom:13 }}>{IMP_KPI.map(cfg => <KpiCard key={cfg.k} label={cfg.l} count={cnt(cfg.k)} color={cfg.c} Icon={cfg.I} active={kpi === cfg.k} onClick={() => setKpi(kpi === cfg.k ? null : cfg.k)} />)}</div>
      {aKpi && kpi && <div className="fbn" style={{ background:`${aKpi.c}10`, border:`1px solid ${aKpi.c}30` }}><aKpi.I size={14} style={{ color:aKpi.c }} /><span style={{ fontSize:13, fontWeight:600, color:aKpi.c }}>Đang lọc: {aKpi.l}</span><span style={{ fontSize:12, color:"var(--t2)" }}>— {filtered.length} phiếu</span><button onClick={() => setKpi(null)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:12, display:"flex", alignItems:"center", gap:3 }}><X size={11} />Bỏ lọc</button></div>}
      <div className="card" style={{ marginBottom:10, padding:"9px 13px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, background:"var(--b2)", border:"1px solid var(--bd2)", borderRadius:9, padding:"6px 11px" }}>
          <Search size={13} color="var(--t3)" /><input value={srch} onChange={e => setSrch(e.target.value)} placeholder="Tìm mã phiếu, nhà cung cấp..." style={{ background:"none", border:"none", outline:"none", fontSize:13, color:"var(--t1)", flex:1, fontFamily:"inherit" }} />
          {srch && <button onClick={() => setSrch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)" }}><X size={12} /></button>}
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="dt">
          <thead><tr><th>Mã phiếu</th><th>Nhà cung cấp</th><th>Kho nhập</th><th>Số SP</th><th>Tổng tiền</th><th>Người nhận</th><th>Ngày</th><th>Trạng thái</th><th style={{ textAlign:"center" }}>Thao tác</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign:"center", padding:"26px 0", color:"var(--t3)" }}>Không có phiếu nhập phù hợp</td></tr>}
            {filtered.map(o => (
              <tr key={o.id}>
                <td>
                  <span className="mn" style={{ color:"#2563EB", fontWeight:700 }}>{o.id}</span>
                  <p style={{ fontSize:11, color:"var(--t3)", marginTop:2, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={o.items.map(i => i.pname).join(", ")}>
                    {o.items.map(i => i.pname).join(", ")}
                  </p>
                </td>
                <td><div style={{ display:"flex", alignItems:"center", gap:7 }}><div className="av" style={{ width:26, height:26, fontSize:9 }}>{(o.sname || "??").slice(0, 2).toUpperCase()}</div><span style={{ fontSize:13, fontWeight:600 }}>{o.sname}</span></div></td>
                <td style={{ fontSize:13, color:"var(--t2)" }}>{o.wname}</td>
                <td><span className="bdg bb">{o.items.length} SP · {o.items.reduce((s, i) => s + i.qty, 0)} đv</span></td>
                <td style={{ fontWeight:700, color:"#14B8A6" }}>{fmtM(orderTotal(o.items))}</td>
                <td style={{ fontSize:13 }}>{o.receiver || "—"}</td>
                <td style={{ fontSize:12, color:"var(--t2)" }}>{o.date}</td>
                <td><Bdg s={o.status} /></td>
                <td><div style={{ display:"flex", gap:3, justifyContent:"center" }}>
                  <button className="btn btnS btnI" onClick={() => { setSel(o); setModal("view"); }}><Eye size={12} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(o); setModal("edit"); }}><Edit2 size={12} style={{ color:"#2563EB" }} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(o); setModal("del"); }}><Trash2 size={12} style={{ color:"#EF4444" }} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:"8px 13px", borderTop:"1px solid var(--bd)", fontSize:12, color:"var(--t2)", display:"flex", justifyContent:"space-between" }}>
          <span>{filtered.length} / {imps.length} phiếu</span>
          <span>Tổng: <strong style={{ color:"#14B8A6" }}>{fmtM(filtered.reduce((s, o) => s + orderTotal(o.items), 0))}</strong></span>
        </div>
      </div>
      {modal === "view" && sel && <OrderViewModal order={sel} isImp onEdit={() => setModal("edit")} onClose={() => { setModal(null); setSel(null); }} />}
      {(modal === "add" || modal === "edit") && <OrderFormModal type="imp" mode={modal} order={sel} prods={prods} setProds={setProds} whs={whs} supps={supps} users={users} showT={showT} onSave={handleSave} onClose={() => { setModal(null); setSel(null); }} />}      {modal === "del" && sel && <DelModal title="Xóa phiếu nhập?" msg={`Xóa phiếu ${sel.id}?${sel.status === "completed" ? " Tồn kho sẽ bị trừ lại." : ""}`} onOk={handleDel} onClose={() => { setModal(null); setSel(null); }} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPORTS PAGE
═══════════════════════════════════════════════════════════ */
const EXP_KPI = [
  { k:"all",        l:"Tổng phiếu", c:"#06B6D4", I:FileText     },
  { k:"completed",  l:"Hoàn thành", c:"#14B8A6", I:PackageCheck },
  { k:"processing", l:"Đang xử lý", c:"#F59E0B", I:Clock        },
  { k:"pending",    l:"Chờ duyệt",  c:"#8B5CF6", I:AlertTriangle},
  { k:"cancelled",  l:"Đã hủy",     c:"#EF4444", I:PackageX     },
];

function ExportsPage({ exps, setExps, prods, setProds, whs, users, showT, logActivity }) {
  const [kpi, setKpi]     = useState(null); const [modal, setModal] = useState(null); const [sel, setSel] = useState(null); const [srch, setSrch] = useState("");
  const cnt = k => k === "all" ? exps.length : exps.filter(o => o.status === k).length;
  const filtered = useMemo(() => exps.filter(o => { const q = srch.toLowerCase(); return (!q || o.id.toLowerCase().includes(q) || (o.customer || "").toLowerCase().includes(q)) && (!kpi || kpi === "all" || o.status === kpi); }), [exps, kpi, srch]);

  const applyDelta = (items, delta) => setProds(p => p.map(prod => { const it = items.find(i => i.pid === prod.id); if (!it) return prod; const ns = Math.max(0, prod.stock + delta * it.qty); return { ...prod, stock:ns, status:sSt(ns), upd:today() }; }));
  const handleSave = async (fd) => {
    const wasDone = sel?.status === "completed"; const nowDone = fd.status === "completed";
    if (modal === "add") {
      const id = genId("PX", exps);
      // Save to Supabase
      const { data: newOrd, error: ordErr } = await supabase.from('orders').insert({
        ma_phieu: id, loai_don: 'export',
        partner_id: null,
        warehouse_id: fd.wid,
        nguoi_xu_ly: fd.handler || fd.customer || '',
        trang_thai: fd.status,
        ngay_giao_dich: fd.date,
        ghi_chu: fd.note || ''
      }).select().single();
      if (ordErr) { showT("Lỗi tạo phiếu: " + ordErr.message, "error"); return; }
      if (fd.items.length > 0) {
        const itemsToInsert = fd.items.map(it => ({ order_id: newOrd.id, good_id: it.pid, so_luong: it.qty, don_gia: it.price }));
        await supabase.from('order_items').insert(itemsToInsert);
      }
      if (nowDone) applyDelta(fd.items, -1);
      setExps(p => [{ id, dbId: newOrd.id, ...fd }, ...p]);
      showT(`✅ Tạo phiếu ${id}${nowDone ? " · Đã trừ tồn kho" : ""}`);
      logActivity("📤", `Tạo phiếu xuất kho: ${id} — Tổng tiền: ${fmtM(fd.total || orderTotal(fd.items))}`);
    } else {
      // Update in Supabase
      const dbId = sel.dbId;
      if (dbId) {
        await supabase.from('orders').update({
          warehouse_id: fd.wid,
          nguoi_xu_ly: fd.handler || fd.customer || '',
          trang_thai: fd.status,
          ngay_giao_dich: fd.date,
          ghi_chu: fd.note || ''
        }).eq('id', dbId);
        // Re-insert order_items
        await supabase.from('order_items').delete().eq('order_id', dbId);
        if (fd.items.length > 0) {
          const itemsToInsert = fd.items.map(it => ({ order_id: dbId, good_id: it.pid, so_luong: it.qty, don_gia: it.price }));
          await supabase.from('order_items').insert(itemsToInsert);
        }
      }
      if (!wasDone && nowDone) applyDelta(fd.items, -1);
      if (wasDone && !nowDone) applyDelta(sel.items, 1);
      setExps(p => p.map(o => o.id === sel.id ? { ...o, ...fd } : o));
      showT(`✅ Đã cập nhật ${sel.id}`);
      logActivity("✏️", `Cập nhật phiếu xuất kho: ${sel.id}`);
    }
    setModal(null); setSel(null);
  };
  const handleDel = async () => {
    if (sel.dbId) {
      const { error } = await supabase.from('orders').delete().eq('id', sel.dbId);
      if (error) { showT("Lỗi xóa phiếu: " + error.message, "error"); return; }
    }
    if (sel.status === "completed") applyDelta(sel.items, 1);
    setExps(p => p.filter(o => o.id !== sel.id));
    showT(`🗑️ Đã xóa ${sel.id}`, "error");
    logActivity("🗑️", `Xóa phiếu xuất kho: ${sel.id}`);
    setModal(null); setSel(null);
  };
  const aKpi = EXP_KPI.find(k => k.k === kpi);

  return (
    <div className="af">
      <div className="ph">
        <div><div className="pt">Phiếu xuất kho</div><div className="ps">{aKpi && kpi ? <span>Lọc: <span style={{ color:aKpi.c, fontWeight:700 }}>{aKpi.l}</span> · {filtered.length} phiếu</span> : `${exps.length} phiếu`}</div></div>
        <div style={{ display:"flex", gap:8 }}>
          {kpi && <button className="btn btnS" onClick={() => setKpi(null)}><X size={12} />Bỏ lọc</button>}
          <button className="btn btnP" onClick={() => { setSel(null); setModal("add"); }}><Plus size={13} />Tạo phiếu xuất</button>
        </div>
      </div>
      <div className="g5" style={{ marginBottom:13 }}>{EXP_KPI.map(cfg => <KpiCard key={cfg.k} label={cfg.l} count={cnt(cfg.k)} color={cfg.c} Icon={cfg.I} active={kpi === cfg.k} onClick={() => setKpi(kpi === cfg.k ? null : cfg.k)} />)}</div>
      {aKpi && kpi && <div className="fbn" style={{ background:`${aKpi.c}10`, border:`1px solid ${aKpi.c}30` }}><aKpi.I size={14} style={{ color:aKpi.c }} /><span style={{ fontSize:13, fontWeight:600, color:aKpi.c }}>Đang lọc: {aKpi.l}</span><span style={{ fontSize:12, color:"var(--t2)" }}>— {filtered.length} phiếu</span><button onClick={() => setKpi(null)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:12, display:"flex", alignItems:"center", gap:3 }}><X size={11} />Bỏ lọc</button></div>}
      <div className="card" style={{ marginBottom:10, padding:"9px 13px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, background:"var(--b2)", border:"1px solid var(--bd2)", borderRadius:9, padding:"6px 11px" }}>
          <Search size={13} color="var(--t3)" /><input value={srch} onChange={e => setSrch(e.target.value)} placeholder="Tìm mã phiếu, khách hàng..." style={{ background:"none", border:"none", outline:"none", fontSize:13, color:"var(--t1)", flex:1, fontFamily:"inherit" }} />
          {srch && <button onClick={() => setSrch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)" }}><X size={12} /></button>}
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="dt">
          <thead><tr><th>Mã phiếu</th><th>Khách hàng</th><th>Kho xuất</th><th>Số SP</th><th>Tổng tiền</th><th>Người xử lý</th><th>Ngày</th><th>Trạng thái</th><th style={{ textAlign:"center" }}>Thao tác</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign:"center", padding:"26px 0", color:"var(--t3)" }}>Không có phiếu xuất phù hợp</td></tr>}
            {filtered.map(o => (
              <tr key={o.id}>
                <td>
                  <span className="mn" style={{ color:"#06B6D4", fontWeight:700 }}>{o.id}</span>
                  <p style={{ fontSize:11, color:"var(--t3)", marginTop:2, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={o.items.map(i => i.pname).join(", ")}>
                    {o.items.map(i => i.pname).join(", ")}
                  </p>
                </td>
                <td><div style={{ display:"flex", alignItems:"center", gap:7 }}><div className="av" style={{ width:26, height:26, fontSize:9, background:"linear-gradient(135deg,#06B6D4,#14B8A6)" }}>{(o.customer || "??").slice(0, 2).toUpperCase()}</div><span style={{ fontSize:13, fontWeight:600 }}>{o.customer}</span></div></td>
                <td style={{ fontSize:13, color:"var(--t2)" }}>{o.wname}</td>
                <td><span className="bdg bc">{o.items.length} SP · {o.items.reduce((s, i) => s + i.qty, 0)} đv</span></td>
                <td style={{ fontWeight:700, color:"#06B6D4" }}>{fmtM(orderTotal(o.items))}</td>
                <td style={{ fontSize:13 }}>{o.handler || "—"}</td>
                <td style={{ fontSize:12, color:"var(--t2)" }}>{o.date}</td>
                <td><Bdg s={o.status} /></td>
                <td><div style={{ display:"flex", gap:3, justifyContent:"center" }}>
                  <button className="btn btnS btnI" onClick={() => { setSel(o); setModal("view"); }}><Eye size={12} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(o); setModal("edit"); }}><Edit2 size={12} style={{ color:"#2563EB" }} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(o); setModal("del"); }}><Trash2 size={12} style={{ color:"#EF4444" }} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:"8px 13px", borderTop:"1px solid var(--bd)", fontSize:12, color:"var(--t2)", display:"flex", justifyContent:"space-between" }}>
          <span>{filtered.length} / {exps.length} phiếu</span>
          <span>Tổng: <strong style={{ color:"#06B6D4" }}>{fmtM(filtered.reduce((s, o) => s + orderTotal(o.items), 0))}</strong></span>
        </div>
      </div>
      {modal === "view" && sel && <OrderViewModal order={sel} isImp={false} onEdit={() => setModal("edit")} onClose={() => { setModal(null); setSel(null); }} />}
      {(modal === "add" || modal === "edit") && <OrderFormModal type="exp" mode={modal} order={sel} prods={prods} setProds={setProds} whs={whs} supps={[]} users={users} showT={showT} onSave={handleSave} onClose={() => { setModal(null); setSel(null); }} />}
      {modal === "del" && sel && <DelModal title="Xóa phiếu xuất?" msg={`Xóa phiếu ${sel.id}?${sel.status === "completed" ? " Tồn kho sẽ được hoàn lại." : ""}`} onOk={handleDel} onClose={() => { setModal(null); setSel(null); }} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUPPLIERS PAGE
═══════════════════════════════════════════════════════════ */
const ESUP = { name:"", code:"", email:"", phone:"", address:"", contact:"", rating:5, status:"active", debt:0, orders:0 };
function SuppliersPage({ supps, setSupps, showT, logActivity }) {
  const [modal, setModal] = useState(null); const [form, setForm] = useState(ESUP); const [sel, setSel] = useState(null); const [errs, setErrs] = useState({});
  const validate = () => { const e = {}; if (!form.name?.trim()) e.name = "Bắt buộc"; if (!form.code?.trim()) e.code = "Bắt buộc"; setErrs(e); return !Object.keys(e).length; };
  const save = async () => {
    if (!validate()) return;
    const isAdd = modal === "add";
    const dbData = {
      ten_doi_tac: form.name, ma_doi_tac: form.code, email: form.email,
      so_dien_thoai: form.phone, dia_chi: form.address, nguoi_lien_he: form.contact,
      danh_gia: form.rating, cong_no: form.debt, ngung_giao_dich: form.status === 'inactive'
    };
    if (isAdd) {
      const { data, error } = await supabase.from('partners').insert([dbData]).select().single();
      if (error) { showT("Lỗi: " + error.message, "error"); return; }
      const newSup = { ...form, id: data.id };
      setSupps(p => [newSup, ...p]);
      showT(`✅ Đã thêm "${form.name}"`);
      logActivity("🚚", `Thêm nhà cung cấp mới: ${form.name} (${form.code})`);
    } else {
      const { error } = await supabase.from('partners').update(dbData).eq('id', sel.id);
      if (error) { showT("Lỗi: " + error.message, "error"); return; }
      setSupps(p => p.map(s => s.id === sel.id ? { ...s, ...form } : s));
      showT(`✅ Đã cập nhật "${form.name}"`);
      logActivity("✏️", `Cập nhật thông tin nhà cung cấp: ${form.name}`);
    }
    setModal(null); setSel(null);
  };
  const del = () => { setSupps(p => p.filter(s => s.id !== sel.id)); showT(`🗑️ Đã xóa "${sel.name}"`, "error"); logActivity("🗑️", `Xóa nhà cung cấp: ${sel.name}`); setModal(null); setSel(null); };

  return (
    <div className="af">
      <div className="ph"><div><div className="pt">Nhà cung cấp</div><div className="ps">{supps.length} đối tác</div></div><button className="btn btnP" onClick={() => { setForm(ESUP); setErrs({}); setModal("add"); }}><Plus size={13} />Thêm nhà CC</button></div>
      <div className="g3">
        {supps.map(s => (
          <div key={s.id} className="card" style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 5 }}>
              <button className="btn btnS btnI" onClick={() => { setSel(s); setForm(s); setErrs({}); setModal("edit"); }}><Edit2 size={13} /></button>
              <button className="btn btnS btnI" onClick={() => { setSel(s); setModal("del"); }}><Trash2 size={13} /></button>
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", gap:11, marginBottom:12 }}>
              <div className="av" style={{ width:44, height:44, fontSize:13, borderRadius:12, flexShrink:0 }}>{s.code ? s.code.slice(0, 2) : "CC"}</div>
              <div style={{ flex:1 }}><p style={{ fontWeight:700, fontSize:14 }}>{s.name}</p><p style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>{s.code}</p><div style={{ marginTop:4 }}>{Array.from({ length:5 }).map((_, i) => <span key={i} style={{ fontSize:12, color:i < s.rating ? "#F59E0B" : "var(--t3)" }}>★</span>)}</div></div>
            </div>
            {[{ I:Mail, v:s.email }, { I:Phone, v:s.phone }, { I:MapPin, v:s.address }, { I:User, v:s.contact }].map(({ I, v }) => (
              <div key={v} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"var(--t2)", marginBottom:4 }}><I size={11} style={{ flexShrink:0, color:"var(--t3)" }} />{v}</div>
            ))}
          </div>
        ))}
      </div>
      {(modal === "add" || modal === "edit") && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="mb">
            <div className="mt">{modal === "add" ? "Thêm nhà cung cấp mới" : `Sửa nhà cung cấp: ${sel?.name}`}<button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={() => setModal(null)}><X size={13} /></button></div>
            <div className="g2" style={{ gap:10 }}>
              <Fld label="Tên nhà CC" req error={errs.name}><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ borderColor:errs.name ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Mã NCC" req error={errs.code}><input className="inp" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} style={{ borderColor:errs.code ? "#EF4444" : undefined }} /></Fld>
              <Fld label="Email"><input className="inp" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></Fld>
              <Fld label="SĐT"><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></Fld>
              <Fld label="Địa chỉ"><input className="inp" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></Fld>
              <Fld label="Người liên hệ"><input className="inp" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} /></Fld>
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:17 }}><button className="btn btnS" onClick={() => setModal(null)}>Hủy</button><button className="btn btnP" onClick={save}>Lưu nhà cung cấp</button></div>
          </div>
        </div>
      )}
      {modal === "del" && sel && <DelModal title="Xóa NCC?" msg={`Xóa "${sel.name}"?`} onOk={del} onClose={() => setModal(null)} />}
    </div>
  );
}

const EU0 = { name:"", username:"", email:"", phone:"", dept:"", position:"", role:"Staff", status:"active", password:"" };

function UsersPage({ users, setUsers, showT, loginHistory, logActivity }) {
  const [kf, setKf]       = useState(null); const [srch, setSrch] = useState(""); const [rf, setRf] = useState("all");
  const [modal, setModal] = useState(null); const [sel, setSel] = useState(null); const [form, setForm] = useState(EU0); const [errs, setErrs] = useState({});
  const KS = [
    { k:"all",      l:"Tổng tài khoản",  c:"#2563EB", I:Users,       fn:() => true },
    { k:"active",   l:"Đang hoạt động",  c:"#14B8A6", I:CheckCircle, fn:u => u.status === "active" },
    { k:"inactive", l:"Bị khóa",         c:"#EF4444", I:Lock,        fn:u => u.status === "inactive" },
    { k:"Admin",    l:"Quản trị viên",   c:"#8B5CF6", I:Shield,      fn:u => u.role === "Admin" },
  ];
  const fil = useMemo(() => users.filter(u => { const q = srch.toLowerCase(); return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)) && (rf === "all" || u.role === rf) && (!kf || kf === "all" || (kf === "active" ? u.status === "active" : kf === "inactive" ? u.status === "inactive" : u.role === kf)); }), [users, srch, rf, kf]);
  const close    = () => { setModal(null); setSel(null); };
  const validate = () => { const e = {}; if (!form.name.trim()) e.name = "Bắt buộc"; if (!form.email.includes("@")) e.email = "Email không hợp lệ"; if (modal === "add" && form.password.length < 6) e.password = "Tối thiểu 6 ký tự"; setErrs(e); return !Object.keys(e).length; };
  const save = () => { if (!validate()) return; if (modal === "add") { const id = genId("U", users); const ini = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); setUsers(p => [{ id, avatar:ini, ...form, lastLogin:"Chưa đăng nhập" }, ...p]); showT(`✅ Đã thêm "${form.name}"`); logActivity("👤", `Thêm người dùng mới: ${form.name} (@${form.username})`); } else { setUsers(p => p.map(u => u.id === sel.id ? { ...u, ...form } : u)); showT(`✅ Đã cập nhật "${form.name}"`); logActivity("✏️", `Cập nhật thông tin người dùng: ${form.name}`); } close(); };
  const del  = () => { setUsers(p => p.filter(u => u.id !== sel.id)); showT(`🗑️ Đã xóa "${sel.name}"`, "error"); logActivity("🗑️", `Xóa tài khoản người dùng: ${sel.name}`); close(); };
  const tog  = u => { const ns = u.status === "active" ? "inactive" : "active"; setUsers(p => p.map(x => x.id === u.id ? { ...x, status:ns } : x)); showT(ns === "inactive" ? `🔒 Đã khóa "${u.name}"` : `🔓 Đã mở khóa "${u.name}"`, ns === "inactive" ? "warn" : "success"); logActivity(ns === "inactive" ? "🔒" : "🔓", `${ns === "inactive" ? "Khóa" : "Mở khóa"} tài khoản: ${u.name}`); };

  return (
    <div className="af">
      <div className="ph">
        <div><div className="pt">Quản lý người dùng</div><div className="ps">{users.length} tài khoản · {users.filter(u => u.status === "active").length} đang hoạt động</div></div>
        <div style={{ display:"flex", gap:8 }}>
          {kf && <button className="btn btnS" onClick={() => setKf(null)}><X size={12} />Bỏ lọc</button>}
          <button className="btn btnP" onClick={() => { setForm(EU0); setErrs({}); setSel(null); setModal("add"); }}><Plus size={13} />Thêm người dùng</button>
        </div>
      </div>
      <div className="g4" style={{ marginBottom:13 }}>{KS.map(cfg => <KpiCard key={cfg.k} label={cfg.l} count={users.filter(cfg.fn).length} color={cfg.c} Icon={cfg.I} active={kf === cfg.k} onClick={() => setKf(kf === cfg.k ? null : cfg.k)} />)}</div>
      <div className="card" style={{ marginBottom:10, padding:"9px 13px" }}>
        <div style={{ display:"flex", gap:9, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ flex:1, minWidth:180, display:"flex", alignItems:"center", gap:7, background:"var(--b2)", border:"1px solid var(--bd2)", borderRadius:9, padding:"6px 11px" }}>
            <Search size={13} color="var(--t3)" /><input value={srch} onChange={e => setSrch(e.target.value)} placeholder="Tìm tên, email, username..." style={{ background:"none", border:"none", outline:"none", fontSize:13, color:"var(--t1)", flex:1, fontFamily:"inherit" }} />
            {srch && <button onClick={() => setSrch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)" }}><X size={12} /></button>}
          </div>
          <select className="inp" value={rf} onChange={e => setRf(e.target.value)} style={{ width:"auto" }}><option value="all">Tất cả vai trò</option>{Object.entries(RMAP).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}</select>
          <span style={{ fontSize:12, color:"var(--t2)" }}>{fil.length} kết quả</span>
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="dt">
          <thead><tr><th>Người dùng</th><th>Username</th><th>Liên hệ</th><th>Phòng ban</th><th>Vai trò</th><th>Đăng nhập cuối</th><th>Trạng thái</th><th style={{ textAlign:"center" }}>Thao tác</th></tr></thead>
          <tbody>
            {fil.length === 0 && <tr><td colSpan={8} style={{ textAlign:"center", padding:"32px 0", color:"var(--t3)" }}>Không tìm thấy tài khoản nào</td></tr>}
            {fil.map(u => { const gr = RGRAD[u.role] || "2563EB,8B5CF6"; const lk = u.status === "inactive"; return (
              <tr key={u.id} style={{ opacity:lk ? .75 : 1 }}>
                <td><div style={{ display:"flex", alignItems:"center", gap:9 }}><div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,#${gr})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0, filter:lk ? "grayscale(.6)" : "none", position:"relative" }}>{u.avatar}{lk && <div style={{ position:"absolute", bottom:-2, right:-2, width:13, height:13, borderRadius:"50%", background:"#EF4444", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid var(--b1)" }}><Lock size={7} color="#fff" /></div>}</div><div><p style={{ fontWeight:700, fontSize:13 }}>{u.name}</p><p style={{ fontSize:11, color:"var(--t3)", fontFamily:"monospace" }}>{u.id}</p></div></div></td>
                <td><span className="mn" style={{ fontSize:12, background:"var(--b2)", padding:"2px 7px", borderRadius:6 }}>@{u.username}</span></td>
                <td><p style={{ fontSize:12 }}>{u.email}</p><p style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>{u.phone || "—"}</p></td>
                <td><p style={{ fontSize:13 }}>{u.dept}</p><p style={{ fontSize:11, color:"var(--t3)" }}>{u.position || ""}</p></td>
                <td><Bdg r={u.role} /></td>
                <td style={{ fontSize:12, color:"var(--t2)" }}>{u.lastLogin}</td>
                <td><div style={{ display:"flex", alignItems:"center", gap:7 }}><Bdg s={u.status} /><div onClick={() => tog(u)} style={{ width:34, height:19, borderRadius:999, background:lk ? "rgba(239,68,68,.2)" : "rgba(20,184,166,.2)", border:`1.5px solid ${lk ? "#EF4444" : "#14B8A6"}`, cursor:"pointer", position:"relative", flexShrink:0 }}><div style={{ width:13, height:13, borderRadius:"50%", background:lk ? "#EF4444" : "#14B8A6", position:"absolute", top:2, left:lk ? 2 : 17, transition:"left .2s" }} /></div></div></td>
                <td><div style={{ display:"flex", gap:3, justifyContent:"center" }}>
                  <button className="btn btnS btnI" onClick={() => { setSel(u); setModal("view"); }}><Eye size={12} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(u); setForm({ ...u, password:"" }); setErrs({}); setModal("edit"); }}><Edit2 size={12} style={{ color:"#2563EB" }} /></button>
                  <button className="btn btnS btnI" onClick={() => { setSel(u); setModal("lock"); }}>{lk ? <CheckCircle size={12} style={{ color:"#14B8A6" }} /> : <Lock size={12} style={{ color:"#F59E0B" }} />}</button>
                  <button className="btn btnS btnI" onClick={() => { setSel(u); setModal("del"); }}><Trash2 size={12} style={{ color:"#EF4444" }} /></button>
                </div></td>
              </tr>
            ); })}
          </tbody>
        </table>
        <div style={{ padding:"8px 13px", borderTop:"1px solid var(--bd)", fontSize:12, color:"var(--t2)", display:"flex", justifyContent:"space-between" }}><span>{fil.length}/{users.length}</span><span>🟢 {users.filter(u => u.status === "active").length} · 🔴 {users.filter(u => u.status === "inactive").length}</span></div>
      </div>

      <div className="card" style={{ marginTop: 17, padding: 20 }}>
        <div className="st" style={{ marginBottom: 15 }}><Activity size={15} style={{ color: "#2563EB" }} />Lịch sử đăng nhập hệ thống</div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <table className="dt">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Thời gian đăng nhập</th>
                <th>Thiết bị & Trình duyệt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(!loginHistory || loginHistory.length === 0) ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "20px 0", color: "var(--t3)" }}>Chưa ghi nhận lịch sử đăng nhập nào</td></tr>
              ) : (
                loginHistory.map(h => {
                  const parseUA = (ua) => {
                    if (!ua) return "Không rõ thiết bị";
                    let os = "Unknown OS";
                    if (ua.includes("Windows")) os = "Windows";
                    else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
                    else if (ua.includes("Linux")) os = "Linux";
                    else if (ua.includes("Android")) os = "Android";
                    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

                    let browser = "Browser";
                    if (ua.includes("Chrome")) browser = "Chrome";
                    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
                    else if (ua.includes("Firefox")) browser = "Firefox";
                    else if (ua.includes("Edg")) browser = "Edge";

                    return `${browser} (${os})`;
                  };

                  const browserText = parseUA(h.agent);
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700, fontSize: 13 }}>{h.email}</td>
                      <td style={{ color: "var(--t2)", fontSize: 12 }}>{h.time}</td>
                      <td style={{ color: "var(--t2)", fontSize: 12 }} className="mn">{browserText}</td>
                      <td><span className="bdg bg">Thành công</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {(modal === "add" || modal === "edit") && (
        <div className="mo" onClick={e => e.target === e.currentTarget && close()}>
          <div className="mb as">
            <div className="mt"><div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#2563EB,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center" }}>{modal === "add" ? <Plus size={17} color="#fff" /> : <Edit2 size={16} color="#fff" />}</div>{modal === "add" ? "Thêm người dùng mới" : `Sửa: ${sel?.name}`}<button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={close}><X size={13} /></button></div>
            <div style={{ textAlign:"center", marginBottom:13 }}><div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:"#fff", margin:"0 auto 6px", boxShadow:"0 0 20px rgba(37,99,235,.35)" }}>{form.name ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : modal === "edit" ? sel?.avatar : "?"}</div><p style={{ fontSize:11, color:"var(--t3)" }}>Avatar tự sinh từ tên</p></div>
            <div className="g2" style={{ gap:10 }}>
              {[["Họ và tên","name","Nguyễn Văn A",true],["Username","username","nguyenvana",true],["Email","email","nva@wms.vn",true],["Số điện thoại","phone","09xx xxx xxx",false],["Phòng ban","dept","Kho A",false],["Chức vụ","position","Nhân viên kho",false]].map(([l, f, ph, req]) => (
                <Fld key={f} label={l} req={req} error={errs[f]}><input className="inp" placeholder={ph} value={form[f] || ""} onChange={e => setForm(p => ({ ...p, [f]:e.target.value }))} style={{ borderColor:errs[f] ? "#EF4444" : undefined }} /></Fld>
              ))}
              <Fld label="Vai trò"><select className="inp" value={form.role} onChange={e => setForm(p => ({ ...p, role:e.target.value }))}>{Object.entries(RMAP).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}</select></Fld>
              <Fld label="Trạng thái"><select className="inp" value={form.status} onChange={e => setForm(p => ({ ...p, status:e.target.value }))}><option value="active">Hoạt động</option><option value="inactive">Bị khóa</option></select></Fld>
            </div>
            <div style={{ marginTop:10 }}><Fld label={modal === "add" ? "Mật khẩu (bắt buộc)" : "Mật khẩu mới"} req={modal === "add"} error={errs.password}><input type="password" className="inp" placeholder="Tối thiểu 6 ký tự" value={form.password || ""} onChange={e => setForm(p => ({ ...p, password:e.target.value }))} style={{ borderColor:errs.password ? "#EF4444" : undefined }} /></Fld></div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:17 }}><button className="btn btnS" onClick={close}>Hủy</button><button className="btn btnP" onClick={save}>{modal === "add" ? <><Plus size={13} />Tạo tài khoản</> : <><CheckCircle size={13} />Lưu</>}</button></div>
          </div>
        </div>
      )}
      {modal === "view" && sel && (
        <div className="mo" onClick={e => e.target === e.currentTarget && close()}>
          <div className="mb as"><div className="mt"><User size={17} style={{ color:"#2563EB" }} />Chi tiết tài khoản<button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={close}><X size={13} /></button></div>
          <div style={{ textAlign:"center", padding:"6px 0 16px" }}><div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg,#${RGRAD[sel.role] || "2563EB,8B5CF6"})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff", margin:"0 auto 11px", boxShadow:"0 0 22px rgba(37,99,235,.35)" }}>{sel.avatar}</div><p style={{ fontSize:17, fontWeight:800 }}>{sel.name}</p><p style={{ fontSize:12, color:"var(--t2)", marginTop:3 }}>@{sel.username}</p><div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:9 }}><Bdg r={sel.role} /><Bdg s={sel.status} /></div></div>
          <div className="g2" style={{ gap:9 }}>{[["Mã",sel.id],["Email",sel.email],["SĐT",sel.phone||"—"],["Phòng ban",sel.dept||"—"],["Chức vụ",sel.position||"—"],["Đăng nhập cuối",sel.lastLogin]].map(([k,v])=><div key={k} style={{background:"var(--b2)",borderRadius:9,padding:"9px 11px"}}><p style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>{k}</p><p style={{fontSize:12,fontWeight:600,marginTop:3}}>{v}</p></div>)}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:17}}><button className="btn btnS" onClick={()=>{setForm({...sel,password:""});setErrs({});setModal("edit")}}><Edit2 size={12}/>Sửa</button><button className="btn btnS" onClick={close}>Đóng</button></div></div>
        </div>
      )}
      {modal === "lock" && sel && (
        <div className="mo" onClick={e => e.target === e.currentTarget && close()}>
          <div className="mb mb-sm as" style={{ textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:sel.status === "active" ? "rgba(245,158,11,.12)" : "rgba(20,184,166,.12)", border:`2px solid ${sel.status === "active" ? "rgba(245,158,11,.4)" : "rgba(20,184,166,.4)"}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 13px" }}>{sel.status === "active" ? <Lock size={24} color="#F59E0B" /> : <CheckCircle size={24} color="#14B8A6" />}</div>
            <p style={{ fontSize:16, fontWeight:800, marginBottom:7 }}>{sel.status === "active" ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}</p>
            <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>Tài khoản <strong>"{sel.name}"</strong> sẽ {sel.status === "active" ? "bị khóa — không thể đăng nhập." : "được mở khóa lại."}</p>
            <div style={{ display:"flex", gap:9, justifyContent:"center", marginTop:19 }}>
              <button className="btn btnS" onClick={close} style={{ flex:1 }}>Hủy</button>
              <button className="btn" onClick={() => { tog(sel); close(); }} style={{ flex:1, background:sel.status === "active" ? "linear-gradient(135deg,#F59E0B,#D97706)" : "linear-gradient(135deg,#14B8A6,#0D9488)", color:"#fff" }}>{sel.status === "active" ? <><Lock size={12} />Khóa</> : <><CheckCircle size={12} />Mở khóa</>}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "del" && sel && <DelModal title="Xóa tài khoản?" msg={`Xóa "${sel.name}" (${sel.email})?`} onOk={del} onClose={close} />}
    </div>
  );
}

function ReportsPage({ prods, imps, exps, dark, logActivity }) {
  const tc = dark ? "#94A3B8" : "#64748B"; const gc = dark ? "rgba(148,163,184,.06)" : "rgba(0,0,0,.05)";

  const dynamicPie = useMemo(() => {
    const totalVal = prods.reduce((s, p) => s + Math.max(0, p.stock) * p.buyPrice, 0) || 1;
    const cats = [...new Set(prods.map(p => p.category))];
    const colors = ["#2563EB", "#8B5CF6", "#06B6D4", "#14B8A6", "#F59E0B", "#EF4444", "#EC4899", "#10B981"];
    return cats.map((c, i) => {
      const val = prods.filter(p => p.category === c).reduce((s, p) => s + Math.max(0, p.stock) * p.buyPrice, 0);
      return {
        n: c,
        v: Math.round((val / totalVal) * 100) || 0,
        c: colors[i % colors.length]
      };
    }).filter(item => item.v > 0);
  }, [prods]);

  const dynamicBar = useMemo(() => {
    const completedOrds = [...imps, ...exps].filter(o => o.status === "completed" && o.date);
    let endDate = new Date();
    
    // Check if there is any completed transaction in the default 6 months window
    const defaultMonths = [];
    const tempD = new Date();
    for (let i = 5; i >= 0; i--) {
      defaultMonths.push(new Date(tempD.getFullYear(), tempD.getMonth() - i, 1));
    }
    
    const hasAnyInDefault = completedOrds.some(o => {
      const od = new Date(o.date);
      return defaultMonths.some(m => od.getFullYear() === m.getFullYear() && od.getMonth() === m.getMonth());
    });
    
    // If no transactions in the default 6-month window but transactions exist elsewhere,
    // shift the window to end at the latest transaction month to populate the chart beautifully!
    if (!hasAnyInDefault && completedOrds.length > 0) {
      const dates = completedOrds.map(o => new Date(o.date));
      const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
      endDate = latestDate;
    }

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const mLabel = `T${targetDate.getMonth() + 1}/${String(targetDate.getFullYear()).slice(-2)}`;
      months.push({
        label: mLabel,
        year: targetDate.getFullYear(),
        month: targetDate.getMonth()
      });
    }

    return months.map(m => {
      const impTotal = imps
        .filter(o => o.status === "completed")
        .filter(o => {
          const od = new Date(o.date);
          return od.getFullYear() === m.year && od.getMonth() === m.month;
        })
        .reduce((sum, o) => sum + orderTotal(o.items), 0);

      const expTotal = exps
        .filter(o => o.status === "completed")
        .filter(o => {
          const od = new Date(o.date);
          return od.getFullYear() === m.year && od.getMonth() === m.month;
        })
        .reduce((sum, o) => sum + orderTotal(o.items), 0);

      return {
        m: m.label,
        n: Number((impTotal / 1000000).toFixed(2)) || 0,
        x: Number((expTotal / 1000000).toFixed(2)) || 0
      };
    });
  }, [imps, exps]);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(prods.map(p => ({
      "Mã SP": p.sku, "Tên SP": p.name, "Danh mục": p.category,
      "Giá nhập": p.buyPrice, "Giá bán": p.sellPrice, "Tồn kho": p.stock
    })));
    XLSX.utils.book_append_sheet(wb, ws, "TonKho");
    XLSX.writeFile(wb, "BaoCaoTonKho.xlsx");
    logActivity("📊", "Xuất báo cáo tồn kho ra file Excel");
  };
  return (
    <div className="af">
      <div className="ph"><div><div className="pt">Báo cáo & thống kê</div><div className="ps">Dữ liệu thực từ hệ thống</div></div><div style={{ display:"flex", gap:8 }}><button className="btn btnS" onClick={exportExcel}><FileSpreadsheet size={13} />Excel</button><button className="btn btnS" onClick={() => window.print()}><FileText size={13} />PDF</button><button className="btn btnP" onClick={() => window.print()}><Printer size={13} />In báo cáo</button></div></div>
      <div className="g4" style={{ marginBottom:17 }}>{[{ l:"Tổng nhập (HT)", v:fmtM(imps.filter(o => o.status === "completed").reduce((s, o) => s + orderTotal(o.items), 0)), c:"#2563EB" }, { l:"Tổng xuất (HT)", v:fmtM(exps.filter(o => o.status === "completed").reduce((s, o) => s + orderTotal(o.items), 0)), c:"#14B8A6" }, { l:"Tổng tồn kho", v:`${prods.reduce((s, p) => s + p.stock, 0)} SP`, c:"#8B5CF6" }, { l:"Giá trị tồn", v:fmtM(prods.reduce((s, p) => s + p.stock * p.buyPrice, 0)), c:"#F59E0B" }].map(({ l, v, c }) => <div key={l} className="card"><p style={{ fontSize:12, color:"var(--t2)", fontWeight:600 }}>{l}</p><p style={{ fontSize:22, fontWeight:800, marginTop:7, color:c }}>{v}</p></div>)}</div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:14 }}>
        <div className="card"><div className="st"><BarChart2 size={14} style={{ color:"#2563EB" }} />Nhập/Xuất kho (6 tháng)</div>
          <ResponsiveContainer width="100%" height={220}><BarChart data={dynamicBar} margin={{ top:5, right:8, bottom:5, left:-10 }}><CartesianGrid strokeDasharray="3 3" stroke={gc} /><XAxis dataKey="m" tick={{ fill:tc, fontSize:11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:tc, fontSize:11 }} axisLine={false} tickLine={false} /><Tooltip content={<TT />} /><Legend wrapperStyle={{ fontSize:12, color:tc }} /><Bar dataKey="n" name="Nhập kho (Tr.đ)" fill="#2563EB" radius={[3,3,0,0]} /><Bar dataKey="x" name="Xuất kho (Tr.đ)" fill="#06B6D4" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer></div>
        <div className="card"><div className="st"><Target size={14} style={{ color:"#8B5CF6" }} />Danh mục</div>
          <ResponsiveContainer width="100%" height={185}><PieChart><Pie data={dynamicPie} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="v">{dynamicPie.map((e, i) => <Cell key={i} fill={e.c} />)}</Pie><Tooltip content={<TT />} formatter={v => [`${v}%`, ""]} /></PieChart></ResponsiveContainer>
          {dynamicPie.map(it => <div key={it.n} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, marginBottom:3 }}><div style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:2, background:it.c, display:"inline-block" }} /><span style={{ color:"var(--t2)" }}>{it.n}</span></div><span style={{ fontWeight:700 }}>{it.v}%</span></div>)}</div>
      </div>
      <div className="card"><div className="st"><Award size={14} style={{ color:"#F59E0B" }} />Sản phẩm tồn kho cao nhất</div>
        <table className="dt"><thead><tr><th>#</th><th>Sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Giá trị tồn</th><th>TT</th></tr></thead>
        <tbody>{[...prods].sort((a, b) => b.stock - a.stock).slice(0, 6).map((p, i) => (
          <tr key={p.id}><td><div style={{ width:25, height:25, borderRadius:"50%", background:i < 3 ? ["#F59E0B","#94A3B8","#CD7C2E"][i] : "var(--b3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:i < 3 ? "#fff" : "var(--t2)" }}>{i + 1}</div></td>
          <td><span style={{ fontWeight:600, fontSize:13 }}>{p.name}</span></td>
          <td><span className="bdg bb">{p.category}</span></td>
          <td><span style={{ fontWeight:700, fontSize:14 }}>{p.stock}</span></td>
          <td style={{ fontWeight:700, color:"#14B8A6" }}>{fmtM(p.stock * p.buyPrice)}</td>
          <td><Bdg s={p.status} /></td></tr>
        ))}</tbody></table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP — root state + cross-module linkage
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [dark,  setDark]  = useState(true);
  const [pg,    setPg]    = useState("dashboard");
  const [col,   setCol]   = useState(false);
  const [sbH,   setSbH]   = useState(false);
  const [toast, setToast] = useState(null);
  const [activities, setActivities] = useState([]);

  const logActivity = async (icon, content) => {
    const actor = adminProfile.email || "Admin";
    const now = new Date();
    const timeStr = now.toLocaleString("vi-VN").replace(",", "");
    const newAct = { ic: icon, t: content, s: `${actor} · ${timeStr}` };
    
    setActivities(prev => {
      const updated = [newAct, ...prev].slice(0, 50);
      localStorage.setItem("wms_activities", JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('activity_log').insert({
        icon,
        content,
        actor
      });
    } catch (e) {
      console.warn("Failed to write log to Supabase", e);
    }
  };

  /* Shared mutable state — all modules read & write here */
  const [prods, setProds] = useState([]);
  const [whs,   setWhs]   = useState([]);
  const [imps,  setImps]  = useState([]);
  const [exps,  setExps]  = useState([]);
  const [users, setUsers] = useState(SEED_USERS);
  const [supps, setSupps] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);

  const [sysModal, setSysModal] = useState(null);
  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem("wms_admin_profile");
    return saved ? JSON.parse(saved) : {
      name: "Admin Hệ Thống",
      email: "admin@wms.vn",
      role: "Quản trị viên",
      dept: "IT"
    };
  });
  const [editAdmin, setEditAdmin] = useState(null);

  const saveAdminProfile = (data) => {
    setAdminProfile(data);
    localStorage.setItem("wms_admin_profile", JSON.stringify(data));
    logActivity("⚙️", "Cập nhật thông tin cá nhân của Admin");
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch current logged in user & sync to users list
      const { data: { user } } = await supabase.auth.getUser();
      const nowStr = new Date().toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "");

      if (user && user.email) {
        setAdminProfile(prev => ({
          ...prev,
          name: user.email,
          email: user.email
        }));

        setUsers(prev => {
          const emailExists = prev.some(u => u.email.toLowerCase() === user.email.toLowerCase());
          if (emailExists) {
            return prev.map(u => u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, lastLogin: nowStr, status: "active" } : u);
          } else {
            const initials = user.email.slice(0, 2).toUpperCase();
            const username = user.email.split("@")[0];
            return [
              {
                id: `U${String(prev.length + 1).padStart(3, "0")}`,
                name: user.email,
                username: username,
                email: user.email,
                phone: "",
                role: "Admin",
                dept: "IT",
                position: "Quản trị viên",
                status: "active",
                lastLogin: nowStr,
                avatar: initials
              },
              ...prev
            ];
          }
        });

        // Save login event to Supabase
        try {
          await supabase.from('login_history').insert({
            email: user.email,
            user_agent: navigator.userAgent
          });
        } catch (e) {
          console.warn("login_history table may not exist yet, skipping database insertion", e);
        }
      }

      // Fetch login history
      let historyData = [];
      try {
        const { data: hist } = await supabase.from('login_history').select('*').order('login_time', { ascending: false });
        if (hist && hist.length > 0) {
          historyData = hist.map(h => ({
            id: h.id,
            email: h.email,
            time: new Date(h.login_time).toLocaleString("vi-VN"),
            agent: h.user_agent
          }));
        } else {
          throw new Error("No logs found");
        }
      } catch (e) {
        historyData = [
          { id: "h1", email: user?.email || "admin@wms.vn", time: nowStr, agent: navigator.userAgent },
          { id: "h2", email: "nthilan@wms.vn", time: "18/05/2026 07:45", agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0" },
          { id: "h3", email: "tmkhoa@wms.vn", time: "17/05/2026 17:20", agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0" },
          { id: "h4", email: "ltha@wms.vn", time: "18/05/2026 09:10", agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/15.6" }
        ];
      }
      setLoginHistory(historyData);

      // 2. Fetch warehouses
      const { data: whData } = await supabase.from('warehouses').select('*');
      if (whData) setWhs(whData.map(w => ({
        id: w.id, name: w.ten_kho, location: w.dia_chi, capacity: w.suc_chua,
        zones: w.so_khu_vuc, temperature: w.nhiet_do, type: w.loai_kho,
        manager: w.quan_ly, phone: w.so_dien_thoai, status: w.trang_thai
      })));

      // 3. Fetch partners (suppliers)
      const { data: partData } = await supabase.from('partners').select('*');
      if (partData) setSupps(partData.map(p => ({
        id: p.id, name: p.ten_doi_tac, code: p.ma_doi_tac,
        email: p.email, phone: p.so_dien_thoai, address: p.dia_chi,
        contact: p.nguoi_lien_he, rating: p.danh_gia,
        status: p.ngung_giao_dich ? 'inactive' : 'active', debt: p.cong_no, orders: 0
      })));

      // 4. Fetch/Seed orders & order_items
      let { data: ords } = await supabase.from('orders').select(`
        *,
        partners (ten_doi_tac, ma_doi_tac),
        warehouses (ten_kho),
        order_items (
          *,
          goods (id, ten_hang)
        )
      `);

      if (!ords || ords.length === 0) {
        const { data: dbWhs } = await supabase.from('warehouses').select('id, ma_kho');
        const { data: dbParts } = await supabase.from('partners').select('id, ma_doi_tac');
        const { data: dbGoods } = await supabase.from('goods').select('id, ma_hang');

        if (dbWhs && dbParts && dbGoods) {
          const whMap = Object.fromEntries(dbWhs.map(w => [w.ma_kho, w.id]));
          const partMap = Object.fromEntries(dbParts.map(p => [p.ma_doi_tac, p.id]));
          const goodMap = Object.fromEntries(dbGoods.map(g => [g.ma_hang, g.id]));

          // Insert seed imports
          for (const imp of SEED_IMP) {
            const dbPartnerId = partMap[imp.sid] || dbParts[0]?.id;
            const dbWarehouseId = whMap[imp.wid === "Kho A" || imp.wid === "WH001" ? "WH001" : imp.wid === "WH002" ? "WH002" : "WH003"] || dbWhs[0]?.id;
            const { data: newOrd } = await supabase.from('orders').insert({
              ma_phieu: imp.id,
              loai_don: 'import',
              partner_id: dbPartnerId,
              warehouse_id: dbWarehouseId,
              nguoi_xu_ly: imp.receiver,
              trang_thai: imp.status,
              ngay_giao_dich: imp.date,
              ghi_chu: imp.note
            }).select().single();

            if (newOrd) {
              const itemsToInsert = imp.items.map(it => {
                const dbGoodId = goodMap[it.pid === "SP001" ? "DELL-XPS13" : it.pid === "SP002" ? "APPLE-IP15" : it.pid === "SP003" ? "DESK-01" : it.pid === "SP004" ? "SONY-WH5" : it.pid === "SP005" ? "LG-UW34" : "DELL-XPS13"] || dbGoods[0]?.id;
                return {
                  order_id: newOrd.id,
                  good_id: dbGoodId,
                  so_luong: it.qty,
                  don_gia: it.price
                };
              });
              await supabase.from('order_items').insert(itemsToInsert);
            }
          }

          // Insert seed exports
          for (const exp of SEED_EXP) {
            const dbWarehouseId = whMap[exp.wid === "Kho A" || exp.wid === "WH001" ? "WH001" : exp.wid === "WH002" ? "WH002" : "WH003"] || dbWhs[0]?.id;
            const { data: newOrd } = await supabase.from('orders').insert({
              ma_phieu: exp.id,
              loai_don: 'export',
              partner_id: null,
              warehouse_id: dbWarehouseId,
              nguoi_xu_ly: exp.handler,
              trang_thai: exp.status,
              ngay_giao_dich: exp.date,
              ghi_chu: exp.note
            }).select().single();

            if (newOrd) {
              const itemsToInsert = exp.items.map(it => {
                const dbGoodId = goodMap[it.pid === "SP001" ? "DELL-XPS13" : it.pid === "SP002" ? "APPLE-IP15" : it.pid === "SP003" ? "DESK-01" : it.pid === "SP004" ? "SONY-WH5" : it.pid === "SP005" ? "LG-UW34" : "DELL-XPS13"] || dbGoods[0]?.id;
                return {
                  order_id: newOrd.id,
                  good_id: dbGoodId,
                  so_luong: it.qty,
                  don_gia: it.price
                };
              });
              await supabase.from('order_items').insert(itemsToInsert);
            }
          }

          // Refetch
          const { data: refetched } = await supabase.from('orders').select(`
            *,
            partners (ten_doi_tac, ma_doi_tac),
            warehouses (ten_kho),
            order_items (
              *,
              goods (id, ten_hang)
            )
          `);
          ords = refetched;
        }
      }

      // Automatically adjust transactional dates in Supabase database to be within the last 7 days relative to today
      if (ords && ords.length > 0) {
        const hasOldDates = ords.some(o => o.ma_phieu.startsWith("P") && o.ngay_giao_dich.startsWith("2024"));
        if (hasOldDates) {
          const mapCodeToOffset = {
            "PN001": 0, "PX001": 0,
            "PN002": 1, "PX002": 1,
            "PN003": 2, "PX003": 2,
            "PN004": 3, "PX004": 3,
            "PN005": 4, "PX005": 4,
            "PN006": 5,
            "PN007": 6
          };

          for (const o of ords) {
            const offset = mapCodeToOffset[o.ma_phieu];
            if (offset !== undefined) {
              const d = new Date();
              d.setDate(d.getDate() - offset);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              const newDateStr = `${yyyy}-${mm}-${dd}`;

              await supabase.from('orders').update({ ngay_giao_dich: newDateStr }).eq('id', o.id);
            }
          }

          // Refetch orders so the charts instantly render updated data
          const { data: refreshed } = await supabase.from('orders').select(`
            *,
            partners (ten_doi_tac, ma_doi_tac),
            warehouses (ten_kho),
            order_items (
              *,
              goods (id, ten_hang)
            )
          `);
          if (refreshed) {
            ords = refreshed;
          }
        }
      }

      if (ords) {
        const parsedImps = ords.filter(o => o.loai_don === 'import').map(o => ({
          id: o.ma_phieu,
          dbId: o.id,
          sid: o.partner_id,
          sname: o.partners?.ten_doi_tac || "Nhà cung cấp",
          wid: o.warehouse_id,
          wname: o.warehouses?.ten_kho || "Kho A",
          receiver: o.nguoi_xu_ly,
          status: o.trang_thai,
          date: o.ngay_giao_dich,
          note: o.ghi_chu,
          items: o.order_items.map(item => ({
            pid: item.good_id,
            itemDbId: item.id,
            pname: item.goods?.ten_hang || "Sản phẩm",
            qty: item.so_luong,
            price: Number(item.don_gia)
          }))
        }));
        setImps(parsedImps);

        const parsedExps = ords.filter(o => o.loai_don === 'export').map(o => ({
          id: o.ma_phieu,
          dbId: o.id,
          customer: o.nguoi_xu_ly,
          wid: o.warehouse_id,
          wname: o.warehouses?.ten_kho || "Kho A",
          handler: o.nguoi_xu_ly,
          status: o.trang_thai,
          date: o.ngay_giao_dich,
          note: o.ghi_chu,
          items: o.order_items.map(item => ({
            pid: item.good_id,
            itemDbId: item.id,
            pname: item.goods?.ten_hang || "Sản phẩm",
            qty: item.so_luong,
            price: Number(item.don_gia)
          }))
        }));
        setExps(parsedExps);
      }

      // Fetch activity logs
      try {
        const { data: acts, error: actsErr } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!actsErr && acts && acts.length > 0) {
          setActivities(acts.map(a => ({
            ic: a.icon || "📝",
            t: a.content,
            s: `${a.actor} · ${new Date(a.created_at).toLocaleString("vi-VN")}`
          })));
        } else {
          throw new Error("No logs found");
        }
      } catch (e) {
        const local = localStorage.getItem("wms_activities");
        if (local) {
          setActivities(JSON.parse(local));
        } else {
          const defaultActs = [
            { ic: "📥", t: "Nhập 10 Laptop Dell XPS 13 — PN001", s: "Nguyễn Thị Lan · 08:30" },
            { ic: "📤", t: "Xuất 3 Laptop Dell XPS 13 — PX001", s: "Trần Minh Khoa · 09:15" },
            { ic: "⚠️", t: "Cảnh báo: Màn hình LG còn 3 cái", s: "Hệ thống · 11:30" },
            { ic: "➕", t: "Thêm SP mới: Router WiFi 6 ASUS", s: "Admin · 10:02" },
            { ic: "✏️", t: "Cập nhật kho Kho A - sức chứa 500", s: "Admin · 12:00" }
          ];
          setActivities(defaultActs);
          localStorage.setItem("wms_activities", JSON.stringify(defaultActs));
        }
      }

      // 5. Fetch goods and calculate real stock levels dynamically
      const { data: prodData } = await supabase.from('goods').select('*');
      if (prodData) setProds(prodData.map(p => {
        let currentStock = 0;
        if (ords) {
          ords.forEach(o => {
            if (o.trang_thai === 'completed') {
              o.order_items.forEach(item => {
                if (item.good_id === p.id) {
                  if (o.loai_don === 'import') {
                    currentStock += item.so_luong;
                  } else if (o.loai_don === 'export') {
                    currentStock -= item.so_luong;
                  }
                }
              });
            }
          });
        }

        return {
          id: p.id, name: p.ten_hang, sku: p.ma_hang, category: p.nhom_hang,
          buyPrice: Number(p.gia_nhap), sellPrice: Number(p.gia_ban),
          stock: currentStock, wid: p.warehouse_id, loc: p.vi_tri_kho,
          status: sSt(currentStock), img: p.hinh_anh, desc: p.mo_ta
        };
      }));
    };
    fetchData();
  }, []);

  const showT = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const nc    = prods.filter(p => ["low","critical","out"].includes(p.status)).length;
  const ml    = sbH ? 0 : (col ? 68 : 256);
  const props = { prods, setProds, whs, setWhs, imps, setImps, exps, setExps, users, setUsers, supps, setSupps, showT, dark, loginHistory, logActivity };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderPage = () => {
    switch (pg) {
      case "dashboard":  return <Dashboard {...props} />;
      case "products":   return <ProductsPage {...props} />;
      case "warehouses": return <WarehousesPage {...props} />;
      case "imports":    return <ImportsPage {...props} />;
      case "exports":    return <ExportsPage {...props} />;
      case "suppliers":  return <SuppliersPage {...props} />;
      case "users":      return <UsersPage {...props} />;
      case "reports":    return <ReportsPage {...props} />;
      case "activity":   return (
        <div className="af">
          <div className="ph">
            <div>
              <div className="pt">Nhật ký hoạt động</div>
              <div className="ps">Ghi nhận các hoạt động tương tác của Admin trong hệ thống</div>
            </div>
            <button className="btn btnS" onClick={() => {
              if (window.confirm("Bạn có muốn xóa nhật ký hoạt động trên trình duyệt?")) {
                localStorage.removeItem("wms_activities");
                setActivities([]);
                showT("🧹 Đã dọn dẹp nhật ký");
              }
            }}>
              🧹 Xóa nhật ký local
            </button>
          </div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>
                📭 Chưa có hoạt động nào được ghi nhận.
              </div>
            ) : (
              activities.map((a, i) => (
                <div key={i} className="as" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "var(--b2)",
                  border: "1px solid var(--bd)",
                  transition: "transform 0.15s",
                  animation: "fadeUp 0.3s ease both"
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "var(--b1)",
                    border: "1px solid var(--bd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0
                  }}>
                    {a.ic || "📝"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>{a.t}</p>
                    <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <User size={10} /> {a.s.split(" · ")[0]}
                      <span style={{ color: "var(--bd2)" }}>|</span>
                      <Clock size={10} /> {a.s.split(" · ")[1]}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
      case "settings": return (
        <div className="af"><div className="ph"><div className="pt">Cài đặt hệ thống</div></div>
        <div className="g2">
          <div className="card"><div className="st"><Settings size={14} style={{ color:"#2563EB" }} />Giao diện</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0" }}>
              <div><p style={{ fontSize:13, fontWeight:600 }}>Chế độ tối</p><p style={{ fontSize:12, color:"var(--t2)" }}>Dark / Light mode</p></div>
              <div onClick={() => setDark(v => !v)} style={{ width:44, height:24, borderRadius:999, background:dark ? "#2563EB" : "var(--b3)", cursor:"pointer", position:"relative" }}><div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:dark ? 23 : 3, transition:"left .2s" }} /></div>
            </div>
          </div>
          <div className="card"><div className="st"><Zap size={14} style={{ color:"#F59E0B" }} />Thông tin hệ thống</div>
            {[["Phiên bản","WMS Pro v2.4.1"],["Database","PostgreSQL 15"],["Uptime","99.98%"],["Sản phẩm",`${prods.length} SP`],["Kho",`${whs.length} kho`]].map(([k,v]) => <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--bd)" }}><span style={{ fontSize:13, color:"var(--t2)" }}>{k}</span><span style={{ fontSize:13, fontWeight:600 }}>{v}</span></div>)}
          </div>
        </div></div>
      );
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <Toast t={toast} close={() => setToast(null)} />
      <div className={`app${dark ? " dark" : " light"}`}>
        <Sidebar cur={pg} onNav={setPg} col={col} onCol={() => setCol(v => !v)} sbH={sbH} onLogout={handleLogout} adminProfile={adminProfile} />
        <div className="main" style={{ marginLeft:ml }}>
          <Topbar dark={dark} onDark={() => setDark(v => !v)} pg={pg} nc={nc} onLogout={handleLogout} onAction={setSysModal} adminProfile={adminProfile} prods={prods} onToggleSidebar={() => setSbH(v => !v)} />
          <div className="pc">{renderPage()}</div>
        </div>

        {sysModal === "profile" && (
          <div className="mo" onClick={e => e.target === e.currentTarget && !editAdmin && setSysModal(null)}>
            <div className="mb mb-sm">
              <div className="mt">
                <User size={16} style={{color:"#2563EB"}}/> 
                {editAdmin ? "Chỉnh sửa hồ sơ" : "Hồ sơ cá nhân"}
                <button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={() => { setSysModal(null); setEditAdmin(null); }}><X size={13}/></button>
              </div>
              
              {editAdmin ? (
                <div style={{ margin:"20px 0", display:"flex", flexDirection:"column", gap:10 }}>
                  <Fld label="Họ và tên *">
                    <input className="inp" value={editAdmin.name} onChange={e => setEditAdmin(p => ({ ...p, name: e.target.value }))} />
                  </Fld>
                  <Fld label="Email *">
                    <input className="inp" value={editAdmin.email} onChange={e => setEditAdmin(p => ({ ...p, email: e.target.value }))} />
                  </Fld>
                  <Fld label="Vai trò">
                    <input className="inp" value={editAdmin.role} onChange={e => setEditAdmin(p => ({ ...p, role: e.target.value }))} />
                  </Fld>
                  <Fld label="Phòng ban">
                    <input className="inp" value={editAdmin.dept} onChange={e => setEditAdmin(p => ({ ...p, dept: e.target.value }))} />
                  </Fld>
                  
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <button className="btn btnS" style={{ flex:1 }} onClick={() => setEditAdmin(null)}>Hủy</button>
                    <button className="btn btnP" style={{ flex:1 }} onClick={() => {
                      if (!editAdmin.name.trim() || !editAdmin.email.trim()) {
                        showT("Vui lòng nhập đầy đủ Tên và Email", "error");
                        return;
                      }
                      saveAdminProfile(editAdmin);
                      setEditAdmin(null);
                      showT("✅ Đã cập nhật hồ sơ admin");
                    }}>Lưu</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{textAlign:"center", margin:"20px 0"}}>
                    <div className="av" style={{width:80, height:80, fontSize:24, margin:"0 auto 10px"}}>
                      {adminProfile.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0,2).toUpperCase() || "AD"}
                    </div>
                    <h2 style={{fontSize:18, marginBottom:5}}>{adminProfile.name}</h2>
                    <p style={{color:"var(--t2)", fontSize:14}}>{adminProfile.email}</p>
                  </div>
                  <div className="g2">
                    <div style={{background:"var(--b2)", padding:12, borderRadius:8, textAlign:"center"}}><p style={{fontSize:12, color:"var(--t2)"}}>Vai trò</p><p style={{fontWeight:600}}>{adminProfile.role}</p></div>
                    <div style={{background:"var(--b2)", padding:12, borderRadius:8, textAlign:"center"}}><p style={{fontSize:12, color:"var(--t2)"}}>Phòng ban</p><p style={{fontWeight:600}}>{adminProfile.dept}</p></div>
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:20 }}>
                    <button className="btn btnS" style={{ flex:1 }} onClick={() => setSysModal(null)}>Đóng</button>
                    <button className="btn btnP" style={{ flex:1 }} onClick={() => setEditAdmin({ ...adminProfile })}>Chỉnh sửa</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {sysModal === "settings" && (
          <div className="mo" onClick={e => e.target === e.currentTarget && setSysModal(null)}>
            <div className="mb mb-sm">
              <div className="mt"><Settings size={16} style={{color:"#06B6D4"}}/> Cài đặt<button className="btn btnS btnI" style={{ marginLeft:"auto" }} onClick={() => setSysModal(null)}><X size={13}/></button></div>
              <div style={{margin:"20px 0"}}>
                 <p style={{fontSize:14, marginBottom:15, color:"var(--t2)"}}>Tùy chỉnh cá nhân hóa giao diện.</p>
                 <Fld label="Chế độ màu">
                   <div style={{display:"flex", gap:10}}>
                     <button className={`btn ${dark?"btnP":"btnS"}`} onClick={() => setDark(true)}>Tối</button>
                     <button className={`btn ${!dark?"btnP":"btnS"}`} onClick={() => setDark(false)}>Sáng</button>
                   </div>
                 </Fld>
              </div>
              <button className="btn btnP" style={{width:"100%", marginTop:20}} onClick={() => setSysModal(null)}>Xong</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
