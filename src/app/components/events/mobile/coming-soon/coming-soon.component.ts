import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.sass']
})
export class ComingSoonComponent implements OnInit, OnChanges {

  @Input() comingSoonType: string;
  @Input() activeBtn: string;

  constructor() {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.activeBtn);
    console.log(this.comingSoonType);
    console.log('1111');
    this.comingSoonImg();
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

    if (this.comingSoonType == 'social' && this.activeBtn == 'pro') {
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
