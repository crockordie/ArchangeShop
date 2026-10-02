import toast from "react-hot-toast";

export const checkCheckoutFormData = (checkoutData: {
  data: {
    [k: string]: FormDataEntryValue;
  };
  products: ProductInCart[];
  subtotal: number;
}) => {
  const data = checkoutData.data;

  if (data?.address === "") {
    toast.error("Address is required");
    return false;
  }

  if (data?.apartment === "") {
    toast.error("Apartment is required");
    return false;
  }

  if (data?.city === "") {
    toast.error("City is required");
    return false;
  }

  if (data?.company === "") {
    toast.error("Company is required");
    return false;
  }

  if (data?.emailAddress === "") {
    toast.error("Email address is required");
    return false;
  }

  if (data?.whatsappAddress === "") {
    toast.error("WhatsApp address is required");
    return false;
  }

  if (data?.firstName === "") {
    toast.error("First name is required");
    return false;
  }

  if (data?.lastName === "") {
    toast.error("Last name is required");
    return false;
  }

  if (data?.paymentType === "") {
    toast.error("Payment type is required");
    return false;
  }

  // Require paymentPhone only for MTN MoMo or Orange Money
  if (data?.paymentType === "mtn-momo" || data?.paymentType === "orange-money") {
    if (!data?.paymentPhone || data.paymentPhone === "") {
      toast.error("Payment phone is required for the selected payment method");
      return false;
    }
  }

  if (data?.phone === "") {
    toast.error("Phone is required");
    return false;
  }

  if (checkoutData?.products.length === 0) {
    toast.error("Products are required");
    return false;
  }

  if (checkoutData?.subtotal === 0) {
    toast.error("Subtotal is required");
    return false;
  }

  return true;
};
