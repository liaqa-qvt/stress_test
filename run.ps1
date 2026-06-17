$env:BASE_URL      = "https://dev.api.n2.market/api/v1"
$env:USER1_EMAIL    = "liamarianaqa@gmail.com"
$env:USER1_PASSWORD = "Teste@qa1"
$env:USER2_EMAIL    = "marianabrito1791@gmail.com"
$env:USER2_PASSWORD = "Teste@qa1"

k6 run --insecure-skip-tls-verify `
  --env BASE_URL=$env:BASE_URL `
  --env USER1_EMAIL=$env:USER1_EMAIL `
  --env USER1_PASSWORD=$env:USER1_PASSWORD `
  --env USER2_EMAIL=$env:USER2_EMAIL `
  --env USER2_PASSWORD=$env:USER2_PASSWORD `
  stress-test-login.js
