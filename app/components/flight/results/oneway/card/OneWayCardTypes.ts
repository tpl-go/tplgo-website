export type Fare = {
  id: string;
  title: string;
  price: string;
  baggage: string;
  meals?: string;
  seatCharge?: string;
  cancellationFee?: string;
  dateChangeFee?: string;
};

export type StopDetail = {
  airport: string;
  layover: string;
  type: string;
};

export type DetailTab = "flight" | "fare" | "rules" | "baggage";