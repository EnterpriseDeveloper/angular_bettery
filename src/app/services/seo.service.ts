import {Injectable} from '@angular/core';
import {Meta} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private meta: Meta) {
  }

  updateMetaTags(metaTags: { title: string,
                                          image?: string })
  {

    this.meta.updateTag({property: 'og:title', content: metaTags?.title});
    this.meta.updateTag({property: 'og:image', content: metaTags.image});

    this.meta.updateTag({name: 'twitter:title', content: metaTags.title});
    this.meta.updateTag({name: 'twitter:image', content: metaTags.image});

  }

}
