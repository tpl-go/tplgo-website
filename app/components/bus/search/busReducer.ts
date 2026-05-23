export type BusState = {
  fromCity: string;
  fromPoint: string;
  toCity: string;
  toPoint: string;
  travelDate: string | null;
};

type BusAction =
  | { type: "SET_FROM_CITY"; payload: string }
  | { type: "SET_FROM_POINT"; payload: string }
  | { type: "SET_TO_CITY"; payload: string }
  | { type: "SET_TO_POINT"; payload: string }
  | { type: "SET_TRAVEL_DATE"; payload: string }
  | { type: "SWAP_LOCATIONS" };

export function busReducer(state: BusState, action: BusAction): BusState {
  switch (action.type) {
    case "SET_FROM_CITY":
      return {
        ...state,
        fromCity: action.payload,
        fromPoint: "",
      };

    case "SET_FROM_POINT":
      return {
        ...state,
        fromPoint: action.payload,
      };

    case "SET_TO_CITY":
      return {
        ...state,
        toCity: action.payload,
        toPoint: "",
      };

    case "SET_TO_POINT":
      return {
        ...state,
        toPoint: action.payload,
      };

    case "SET_TRAVEL_DATE":
      return {
        ...state,
        travelDate: action.payload,
      };

    case "SWAP_LOCATIONS":
      return {
        ...state,
        fromCity: state.toCity,
        fromPoint: state.toPoint,
        toCity: state.fromCity,
        toPoint: state.fromPoint,
      };

    default:
      return state;
  }
}