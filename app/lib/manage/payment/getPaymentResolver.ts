export function getPaymentResolver(type: string) {
  switch (type) {
    case "flight":
      return require("../paymentResolvers/flightPaymentResolver");

    case "hotel":
      return require("../paymentResolvers/hotelPaymentResolver");

    case "homestay":
      return require("../paymentResolvers/homestayPaymentResolver");

    case "package":
      return require("../paymentResolvers/packagePaymentResolver");

    case "bus":
      return require("../paymentResolvers/busPaymentResolver");

    case "cab":
      return require("../paymentResolvers/cabPaymentResolver");

    case "cruise":
      return require("../paymentResolvers/cruisePaymentResolver");

    case "train":
      return require("../paymentResolvers/trainPaymentResolver");

    default:
      throw new Error("Unsupported payment type");
  }
}