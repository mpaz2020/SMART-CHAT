import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { Message } from '../models/message.model';
import { OpenaiService } from '../services/openai.service';
import { CustomValidators } from '../utils/custom-validators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  messages: Message[] = [];

  form = new FormGroup({
    prompt: new FormControl('', [
      Validators.required,
      CustomValidators.noWhiteSpace,
    ]),
  });

  loading: boolean = false;

  constructor(private openai: OpenaiService) {}

  onSubmit() {
    if (!this.form.valid) return;

    let promt = this.form.value.prompt as string;
    let userMsg: Message = { sender: 'me', content: promt };
    this.messages.push(userMsg);
    let botMsg: Message = { sender: 'bot', content: '' };
    this.messages.push(botMsg);
    this.scrollToBottom();
    this.form.reset();
    this.form.disable();

    this.loading = true;

    this.openai.sendQuestion(promt).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.typeText(res.bot);
        this.form.enable();
      },
      error: (error: any) => {
        console.log(error);
      },
    });

    // setTimeout(() => {
    //   this.loading = false;
    //   this.typeText(
    //     `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
    //   );
    //   this.form.enable();
    // }, 2000);
  }

  typeText(text: string) {
    let textIndex = 0;
    let messagesLastIndex = this.messages.length - 1;
    let interval = setInterval(() => {
      if (textIndex < text.length) {
        this.messages[messagesLastIndex].content += text.charAt(textIndex);
        textIndex++;
      } else {
        clearInterval(interval);
        this.scrollToBottom();
      }
    }, 15);
  }

  scrollToBottom() {
    this.content.scrollToBottom(2000);
  }
}
