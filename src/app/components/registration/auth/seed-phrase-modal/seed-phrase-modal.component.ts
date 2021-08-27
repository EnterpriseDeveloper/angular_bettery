import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-seed-phrase-modal',
  templateUrl: './seed-phrase-modal.component.html',
  styleUrls: ['./seed-phrase-modal.component.sass']
})
export class SeedPhraseModalComponent implements OnInit {
  @Input() modalStatus: boolean;
  @Input() showSeedPhrase: string;
  @Input() isCorrectPhrase: boolean;
  seedPhrase: string;
  @Output() okEmmit = new EventEmitter<object>();

  constructor() {
  }

  ngOnInit(): void {
  }

  modalBtnAction(text: string) {
    text === 'Ok' ? this.okEmmit.emit({ btn: text, seedPh: this.seedPhrase}) : this.okEmmit.emit({ btn: text});
  }
}
