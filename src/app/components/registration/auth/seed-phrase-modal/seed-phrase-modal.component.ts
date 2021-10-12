import {Component, Input, OnInit, Output, EventEmitter, HostListener, ViewChild, ElementRef} from '@angular/core';
import {ClipboardService} from "ngx-clipboard";

@Component({
  selector: 'app-seed-phrase-modal',
  templateUrl: './seed-phrase-modal.component.html',
  styleUrls: ['./seed-phrase-modal.component.sass']
})
export class SeedPhraseModalComponent implements OnInit {
  @Input() modalStatus: boolean;
  @Input() showSeedPhrase: { mnemonic: string, wallet: string };
  @Input() isCorrectPhrase: boolean;
  seedPhrase: string;
  @Output() okEmmit = new EventEmitter<object>();
  seedPhraseArr: string[];
  testArr = ['item', 'bottom', 'mask', 'stove', 'enlist', 'shiver', 'deal', 'raise', 'excuse', 'club', 'arctic', 'gain', 'hard', 'sponsor', 'snake', 'fold', 'seed',
    'grace', 'wagon', 'slam', 'clean', 'cycle', 'swing', 'gossip',];
  showCopiedMessage = false;

  constructor(private _clipboardService: ClipboardService) {
  }

  @HostListener('window:keyup.escape') onKeydownHandler() {
    if (!this.showSeedPhrase) {
      this.modalBtnAction('Cancel');
    }
  }

  ngOnInit(): void {
    if (this.showSeedPhrase?.mnemonic) {
      this.splitSeedPhrase(this.showSeedPhrase.mnemonic);
    }
  }

  modalBtnAction(text: string) {
    if (this.seedPhrase) {
      if (text === 'Ok') {
        this.okEmmit.emit({btn: text, seedPh: this.seedPhrase});
      }
    }
    if (text !== 'Ok') {
      this.okEmmit.emit({btn: text, seedPh: this.showSeedPhrase});
    }
  }

  splitSeedPhrase(str: string) {
    this.seedPhraseArr = str.split(' ');
  }

  copyToClipBoard() {
   if ( this.showSeedPhrase?.mnemonic ){
     this._clipboardService.copy(this.showSeedPhrase.mnemonic);
     this.showCopyMessage();
   }
  }
  showCopyMessage(){
    this.showCopiedMessage = true;
    setTimeout(() => {
      this.showCopiedMessage = false;
    }, 500 );
  }
}
