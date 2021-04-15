const LINKS_PATH = "/links"
const LINKS_CONTENT = [
  {
    name: "tablecheck",
    url: "https://www.tablecheck.com/"
  },
  {
    name: "aldira",
    url: "https://www.linkedin.com/in/aldiraputra/"
  },
  {
    name: "tokyodev",
    url: "https://www.tokyodev.com/companies/tablecheck/jobs/it-infrastructure-engineer/"
  }
]

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  console.log(url.pathname);
  if (url.pathname === LINKS_PATH) {
    const content = JSON.stringify(LINKS_CONTENT);
    return new Response(content, {
      headers: {
        "content-type": "application/json;charset=UTF-8"
      }
    });
  }
  return new Response(`request method: ${request.method}`)
}
