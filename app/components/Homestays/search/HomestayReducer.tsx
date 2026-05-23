export function HomestayReducer(state: any, action: any) {

  switch (action.type) {

    case "SET_CITY":
      return {
        ...state,
        city: action.payload
      };

    case "SET_CHECKIN":
      return {
        ...state,
        checkIn: action.payload
      };

    case "SET_CHECKOUT":
      return {
        ...state,
        checkOut: action.payload
      };

    /* ⭐ Multi Room Support */
    case "SET_ROOMS":
      return {
        ...state,
        rooms: action.payload
      };

    case "PRICE":
      return {
        ...state,
        price: action.payload
      };

    default:
      return state;
  }
}