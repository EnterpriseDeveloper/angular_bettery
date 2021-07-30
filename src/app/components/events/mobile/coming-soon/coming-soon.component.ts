import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.sass']
})
export class ComingSoonComponent implements OnInit {

  @Input() comingSoonType: string;

  constructor() {
  }

  ngOnInit(): void {

  }

  comingSoonImg() {
    if (this.comingSoonType === 'moments') {
      return {
        img: 'moments_img',
        about_title: 'Moments',
        about_text: ' will let you bet on what happens next or what’s going on in obscured photos or short videos.'
      };
    }

    if (this.comingSoonType === 'live') {
      return {
        img: 'live_img',
        about_title: 'Live events',
        about_text: ' will let you bet on any livestreams like sports, gaming, TV shows, etc. while they’re happening.'
      };
    }

    if (this.comingSoonType === 'pro') {
      return {
        img: 'pro_img',
        about_title: 'Pro events,',
        about_text: ' hosted by Influencers and Businesses, will let you earn massively - if you meet the Reputation level for them that is ;-)'
      };
    }

    if (this.comingSoonType === 'following') {
      return {
        img: 'following_img',
        about_title: '',
        about_text: 'Join more Events from Trending to get updates in your Following timeline.'
      };
    }
  }

}
