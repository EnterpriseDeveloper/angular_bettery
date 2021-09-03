import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

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

  constructor() {
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
    if ( text !== 'Ok'){
        this.okEmmit.emit({btn: text, seedPh: this.showSeedPhrase});
    }
  }

  splitSeedPhrase(str: string) {
    this.seedPhraseArr = str.split(' ');
  }
}
