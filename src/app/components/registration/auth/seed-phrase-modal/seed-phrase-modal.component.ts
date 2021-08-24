import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-seed-phrase-modal',
  templateUrl: './seed-phrase-modal.component.html',
  styleUrls: ['./seed-phrase-modal.component.sass']
})
export class SeedPhraseModalComponent implements OnInit {
  @Input() modalStatus;
  @Input() showSeedPhrase;
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
