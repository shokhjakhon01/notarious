const login = async (email, password) => {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()
    console.log(data)

    // if (data.status === "success") {
    //   showAlert("success", "Logged in successfully!")
    //   window.setTimeout(() => {
    //     location.assign("/")
    //   }, 1500)
    // } else {
    //   showAlert("error", data.message)
    // }
  } catch (err) {
    // showAlert("error", "An error occurred while processing your request.")
  }
}

document.querySelector(".form").addEventListener("submit", async (e) => {
  e.preventDefault()
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  console.log(password, email)
  login(email, password)
})
