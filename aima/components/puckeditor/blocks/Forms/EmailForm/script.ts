export const handleSubmitEmailForm = `
    const emailForm = document.getElementById("emailForm")
    if(emailForm) {
        emailForm.addEventListener("submit",async function (event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const values = Object.fromEntries(data.entries());

        const body = {
                firstName: values.emailFormFullName,
                lastName: "",
                email: values.emailFormEmail,
                phoneNumber: values.emailFormPhoneNumber ?? "",
                address: {
                    addressFullName: values.addressFullName ?? "",
                    addressStreet: values.addressStreet ?? "",
                    addressApartment: values.addressApartment ?? "",
                    addressCity: values.addressCity ?? "",
                    addressState: values.addressState ?? "",
                    addressCountry: values.addressCountry ?? "",
                    addressZipCode: values.addressZipCode ?? "",
                },
                shippingAddress: {
                    shippingAddressFullName: values.shippingAddressFullName ?? "",
                    shippingAddressStreet: values.shippingAddressStreet ?? "",
                    shippingAddressApartment: values.shippingAddressApartment ?? "",
                    shippingAddressCity: values.shippingAddressCity ?? "",
                    shippingAddressState: values.shippingAddressState ?? "",
                    shippingAddressCountry: values.shippingAddressCountry ?? "",
                    shippingAddressZipCode: values.shippingAddressZipCode ?? "",
                },
        }
        
        const parsedUrl = new URL(window.location.href);
        const apiUrl = parsedUrl.protocol + '//' + parsedUrl.host;
         
       const response = await fetch(apiUrl + "/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...body,
            email: body.email,
            name: body.firstName,
            url: window.location.href,
          }),
        })
        
        const removeToast = (toast) => {
               toast.classList.add("hide")
               if (toast.timeoutId) clearTimeout(toast.timeoutId)
               setTimeout(() => toast.remove(), 500)
        }
        const toast = document.createElement("div")
        
       if(response?.ok) {
         event.target.reset()
         toast.className = "toast toast-success"
         toast.innerHTML = "<div><span>Email sent successfully</span></div>"
         emailForm.appendChild(toast) 
         toast.timeoutId = setTimeout(() => removeToast(toast), 4000)
       } else {
        toast.className = "toast toast-error"
         toast.innerHTML = "<div><span>Something went wrong</span></div>"
         emailForm.appendChild(toast) 
         toast.timeoutId = setTimeout(() => removeToast(toast), 4000)
       }
    }, false);
    }
`;
