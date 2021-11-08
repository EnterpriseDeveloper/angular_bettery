import {Injectable} from '@angular/core';
import {Meta} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  descriptionAdd = '? Bet against others or validate the result for easy earnings. Sign up to get free tokens now!';

  constructor(private meta: Meta) {
  }

  updateMetaTags(metaTags: { title: string, image?: string, description: string }) {
    metaTags.description = metaTags.description + this.descriptionAdd;

    this.meta.updateTag({property: 'og:title', content: metaTags?.title});
    this.meta.updateTag({property: 'og:description', content: metaTags?.description});
    this.meta.updateTag({name: 'twitter:title', content: metaTags.title});
    this.meta.updateTag({name: 'twitter:description', content: metaTags.description});

    if (metaTags.image) {
      this.meta.updateTag({property: 'og:image', content: metaTags.image});
      this.meta.updateTag({name: 'twitter:image', content: metaTags.image});
    } else {
      this.meta.removeTag("property='og:image'");
      this.meta.removeTag("name='twitter:image'");
    }

  }

}
