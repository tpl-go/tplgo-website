export function hotelReducer(state:any, action:any){

const safeState = {
  city:"",
  checkIn:null,
  checkOut:null,
  rooms:[{adults:2,children:0}],
  price:"",
  ...state
};

switch(action.type){

case "SET_CITY":
return {...safeState, city:action.payload};

case "SET_CHECKIN":
return {...safeState, checkIn:action.payload};

case "SET_CHECKOUT":
return {...safeState, checkOut:action.payload};

/* ⭐ MAIN ROOM UPDATE */
case "SET_ROOMS":
return {...safeState, rooms:action.payload};

case "PRICE":
return {...safeState, price:action.payload};

default:
return safeState;

}
}