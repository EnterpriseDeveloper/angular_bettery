import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../../helpers/must-much.validator';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';


@Component({
  selector: 'registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.sass']
})
export class RegistrationComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  faTimes = faTimes;

  @Output() regisModalEvent = new EventEmitter<boolean>();


  constructor(private formBuilder: FormBuilder) { }

  registrationModal(){
    this.regisModalEvent.emit(false);
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
        validator: MustMatch('password', 'confirmPassword')
      });
  }

  get f() { return this.registerForm.controls; }


  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    

    // continue

    // var web3 = new Web3('ws://localhost:7545');
    // console.log(web3);
    // web3.eth.getAccounts().then((x)=>{
    //   console.log(x)
    // })
  }


  onReset() {
    this.submitted = false;
    this.registerForm.reset();
    this.registrationModal();
  }

}
