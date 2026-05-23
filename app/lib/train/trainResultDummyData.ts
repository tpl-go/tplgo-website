import type { TrainTemplate } from "./trainResultTypes";

export const TRAIN_TEMPLATES: TrainTemplate[] = [
  {
    name: "BPL JP EXP",
    number: "19712",
    departureTime: "08:20 PM",
    arrivalTime: "09:50 AM",
    duration: "13h 30m",
    confirmedOptionTag: "Confirmed Options",
  },
  {
    name: "GOLDEN TEMPLE MAIL",
    number: "12904",
    departureTime: "04:55 AM",
    arrivalTime: "05:05 AM",
    duration: "24h 10m",
  },
  {
    name: "NGP JP SUP EXP",
    number: "22175",
    departureTime: "09:05 PM",
    arrivalTime: "10:30 AM",
    duration: "13h 25m",
    confirmedOptionTag: "Confirmed Options",
    confirmedOptionDescription:
      "Your ticket will be booked on a longer route. Board at source and get down at destination.",
  },
  {
    name: "RANTHAMBHORE EXP",
    number: "12465",
    departureTime: "07:30 AM",
    arrivalTime: "06:10 PM",
    duration: "10h 40m",
  },
  {
    name: "INTERCITY SUPERFAST EXPRESS",
    number: "12978",
    departureTime: "06:40 AM",
    arrivalTime: "03:25 PM",
    duration: "8h 45m",
    offerTag: "Top Rated",
  },
  {
    name: "MALWA SF EXPRESS",
    number: "22941",
    departureTime: "11:10 PM",
    arrivalTime: "11:20 AM",
    duration: "12h 10m",
  },
  {
    name: "RAJDHANI CONNECT",
    number: "12953",
    departureTime: "05:45 PM",
    arrivalTime: "04:30 AM",
    duration: "10h 45m",
    offerTag: "Fastest",
  },
  {
    name: "SHATABDI LINK",
    number: "12018",
    departureTime: "06:05 AM",
    arrivalTime: "01:15 PM",
    duration: "7h 10m",
    offerTag: "Day Journey",
  },
];

export const TRAIN_CLASS_CODES = ["1A", "2A", "3A", "3E", "SL", "CC", "2S", "EC"];

export const TRAIN_RUN_DAYS = ["S", "M", "T", "W", "T", "F", "S"];