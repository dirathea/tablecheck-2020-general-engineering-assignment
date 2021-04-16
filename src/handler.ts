/**
 * defines basic object type for links, contains name and url
 */
interface links {
  name: string,
  url: string,
}

/**
 * defines link for social URLs
 */
interface socialLink extends links {
  svg: string,
  svgText?: string,
}

const LINKS_PATH = "/links"
const STATIC_HTML_SOURCE_URL = "https://static-links-page.signalnerve.workers.dev"
const LINK_SELECTOR = "div#links";
const PROFILE_SELECTOR = "div#profile";
const AVATAR_SELECTOR = "img#avatar";
const AVATAR_URL = "https://avatars.githubusercontent.com/u/1830284?s=60&v=4";
const PROFILE_NAME_SELECTOR = "h1#name";
const PROFILE_NAME = "dirathea";
const SOCIAL_SELECTOR = "div#social";
const TITLE_SELECTOR = "title";
const TITLE = "dirathea - tablecheck assignment";
const BODY_SELECTOR = "body";
const BODY_BG_CLASS = "bg-indigo-900"

/**
 * Contains all the json content that returned on `/links` and also used for replacing HTML url
 */
const LINKS_CONTENT: links[] = [
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

/**
 * Contains
 */
const SOCIAL_LINKS: socialLink[] = [
  {
    name: "github",
    url: "https://github.com/dirathea",
    svg: "https://simpleicons.org/icons/github.svg",
  },
  {
    name: "twitter",
    url: "https://twitter.com/diraldira",
    svg: "https://simpleicons.org/icons/twitter.svg",
  }
]

class LinksTransformer {
  links: links[];

  constructor(links: links[]) {
    this.links = links
  }

  async element(element: Element) {
    const content = this.links.map(l => (`<a href="${l.url}">${l.name}</a>`)).join("\n");
    element.setInnerContent(content, { html: true });
  }
}

class ProfileTransformer {
  constructor() { }

  async element(element: Element) {
    element.removeAttribute("style")
  }
}

class AvatarTransformer {
  avatar: string;
  targetAttribute: string = "src";
  constructor(avatar: string) {
    this.avatar = avatar;
  }

  async element(element: Element) {
    element.setAttribute(this.targetAttribute, this.avatar)
  }
}

class ProfileNameTransformer {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  async element(element: Element) {
    element.setInnerContent(this.name);
  }
}

class SocialTransformer {
  links: socialLink[]
  constructor(links: socialLink[]) {
    this.links = links;
  }

  async element(element: Element) {
    // In this section, we fetch the svg content and store the string on attributes svgText, resulting an array of Promises.
    const fetchedLinksPromise = this.links.map(async l => {
      const svgResp = await fetch(l.svg);
      const svgText = await svgResp.text();
      l.svgText = svgText
      return l;
    });
    
    // Then wait for all the links to be resolved.
    const fetchedLinks = await Promise.all(fetchedLinksPromise)

    // Construct the content from svgText and url links, set it as InnerContent
    const content =  fetchedLinks.map(l => (
      `<a href="${l.url}">${l.svgText}</a>`
    )).join("\n");
    element.removeAttribute("style")
      .setInnerContent(content, {html: true});
  }
}

class TitleTransformer {
  title: string
  constructor(title:string){
    this.title = title;
  }

  async element(element: Element) {
    element.setInnerContent(this.title);
  }
}

class BackgroundTransformer {
  bgClass: string
  constructor(bgClass:string) {
    this.bgClass = bgClass;
  }

  async element(element: Element) {
    element.setAttribute("class", this.bgClass);
  }
}

const rewriter = new HTMLRewriter()
  .on(LINK_SELECTOR, new LinksTransformer(LINKS_CONTENT))
  .on(PROFILE_SELECTOR, new ProfileTransformer())
  .on(AVATAR_SELECTOR, new AvatarTransformer(AVATAR_URL))
  .on(PROFILE_NAME_SELECTOR, new ProfileNameTransformer(PROFILE_NAME))
  .on(SOCIAL_SELECTOR, new SocialTransformer(SOCIAL_LINKS))
  .on(TITLE_SELECTOR, new TitleTransformer(TITLE))
  .on(BODY_SELECTOR, new BackgroundTransformer(BODY_BG_CLASS))

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === LINKS_PATH) {
    const content = JSON.stringify(LINKS_CONTENT);
    return new Response(content, {
      headers: {
        "content-type": "application/json;charset=UTF-8"
      }
    });
  }

  // Fetch html and replace the content to use the json
  const htmlResp = await fetch(STATIC_HTML_SOURCE_URL)
  return rewriter.transform(htmlResp);
}
