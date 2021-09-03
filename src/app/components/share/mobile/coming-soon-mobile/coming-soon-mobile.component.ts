import {Component, Input, OnChanges, Output, SimpleChanges, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-coming-soon-mobile',
  templateUrl: './coming-soon-mobile.component.html',
  styleUrls: ['./coming-soon-mobile.component.sass']
})
export class ComingSoonMobileComponent implements  OnChanges {

  @Input() comingSoonType: string;
  @Input() activeBtn: string;
  exploreHref = 'https://friendlybets.medium.com/from-social-betting-to-collective-knowledge-part-2-play-your-way-earn-your-way-4252acbfae21';

  @Output() setComingSoonFromComponent = new EventEmitter();

  constructor(private router: Router) {
  }


  ngOnChanges(changes: SimpleChanges) {
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
        about_text: ' hosted by Influencers and Businesses, will let you earn massively - if you meet the ReputationModel level for them that is ;-)',
      };
    }

    if (this.comingSoonType === 'social' && this.activeBtn == 'following') {
      return {
        img: 'following_img',
        about_title: '',
        about_text: 'Join more Events from Trending to get updates in your Following timeline.'
      };
    }
  }

  outPutComingSoonType(){
    if (this.activeBtn === 'pro' && this.comingSoonType == 'social'){

      this.router.navigate([]).then(result => {
        window.open(this.exploreHref, '_self' );
      });

    }else {
      this.setComingSoonFromComponent.emit({type: 'social', active: 'trending'});
    }
  }
}
