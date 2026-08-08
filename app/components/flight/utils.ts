/* ===================================================== */
/* ================== AIRPORT MOCK ===================== */
/* ===================================================== */

export type Airport = {
  code: string;
  city: string;
  name: string;
  country: string;
  aliases?: string[];
  popularRank?: number;
};

export const AIRPORTS: Airport[] = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi Intl", country: "India" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Intl", country: "India" },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE" },
  { code: "LHR", city: "London", name: "Heathrow", country: "UK" },
  { code: "JFK", city: "New York", name: "JFK Intl", country: "USA" },
  { code: "SIN", city: "Singapore", name: "Changi", country: "Singapore" },
];

/* ===================================================== */
/* ================= DATE UTILITIES ==================== */
/* ===================================================== */

export function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isAfter(a: Date, b: Date) {
  return a.getTime() > b.getTime();
}

export function addMonths(date: Date, count: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + count);
  return d;
}

/* ===================================================== */
/* ====== 🔥 2 MONTH CALENDAR GENERATOR (FINAL) ========= */
/* ===================================================== */

export function generateMonths(){

const months=[];

const today=new Date();

for(let i=0;i<2;i++){

const date=new Date(today.getFullYear(),today.getMonth()+i,1);

const year=date.getFullYear();
const month=date.getMonth();

const firstDay=new Date(year,month,1).getDay();
const lastDate=new Date(year,month+1,0).getDate();

const days=[];

// blank boxes
for(let b=0;b<firstDay;b++){
days.push(null);
}

// actual dates
for(let d=1;d<=lastDate;d++){
days.push(d);
}

months.push({
name:date.toLocaleString("default",{month:"long",year:"numeric"}),
year,
month,
days
});

}

return months;

}
