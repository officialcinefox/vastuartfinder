// Test login credentials cases
async function test() {
  const cases = [
    { email: "admin@krutik.in", password: "admin" },
    { email: "admin@krutik.in", password: "KrutikVastu2026!" },
    { email: "admin@krutik.in", password: "admin123" },
    { email: "user@gmail.com", password: "admin" },
    { email: "krutik", password: "krutik" },
    { email: "admin@krutik.in", password: "random_wrong_pass" }
  ];

  for (const c of cases) {
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c)
    });
    const data = await res.json();
    console.log(`Email: "${c.email}", Pwd: "${c.password}" -> Status: ${res.status}, Success: ${data.success}, Msg: ${data.message || data.error}`);
  }
}
test();
