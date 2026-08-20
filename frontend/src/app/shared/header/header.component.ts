import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnDestroy
} from '@angular/core';

import {
    Router,
    NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { CommonModule } from '@angular/common';

import {
    FormsModule
} from '@angular/forms';

import {
    io,
    Socket
} from 'socket.io-client';

import {
    ReminderService,
    Reminder
} from '../../services/reminder.service';


@Component({
    selector: 'app-header',

    standalone: true,

    imports: [
        CommonModule,
        FormsModule
    ],

    templateUrl: './header.component.html',

    styleUrl: './header.component.css'
})
export class HeaderComponent
    implements OnDestroy {


    /* =========================================
       SOCKET
    ========================================== */

    private socket!: Socket;


    /* =========================================
       HEADER TITLE
    ========================================== */

    @Input()
    title = 'Dashboard';


    /* =========================================
       MENU EVENT
    ========================================== */

    @Output()
    menuClick =
        new EventEmitter<void>();


    /* =========================================
       NOTIFICATIONS
    ========================================== */

    notifications = 0;

    showNotifications = false;


    /* =========================================
       REMINDER MODAL
    ========================================== */

    showReminderForm = false;

    savingReminder = false;

    reminderSaved = false;


    /* =========================================
       REMINDER FORM
    ========================================== */

    reminder: Reminder = {

        type: 'Birthday',

        customerName: '',

        date: '',

        time: '',

        guests: undefined,

        tableNumber: '',

        notes: '',

        remindBefore: '1 hour'

    };


    /* =========================================
       CONSTRUCTOR
    ========================================== */

    constructor(

        private router: Router,

        private reminderService:
            ReminderService

    ) {


        /* =====================================
           ROUTER
        ===================================== */

        this.router.events

            .pipe(

                filter(

                    event =>
                        event instanceof NavigationEnd

                )

            )

            .subscribe(() => {

                this.updateTitle();

            });


        this.updateTitle();


        /* =====================================
           SOCKET.IO
        ===================================== */

        this.socket = io(
            'https://cafeqr-wds8.onrender.com'
        );


        /* =====================================
           NEW ORDER
        ===================================== */

        this.socket.on(

            'newOrder',

            (order: any) => {

                console.log(
                    'NEW ORDER:',
                    order
                );


                this.notifications++;


                this.playNotificationSound();

            }

        );

    }


    /* =========================================
       SIDEBAR
    ========================================== */

    toggleSidebar(): void {

        this.menuClick.emit();

    }


    /* =========================================
       NOTIFICATIONS
    ========================================== */

    toggleNotifications(): void {

        this.showNotifications =
            !this.showNotifications;

    }


    clearNotifications(): void {

        this.notifications = 0;

        this.showNotifications = false;

    }


    /* =========================================
       OPEN REMINDER FORM
    ========================================== */

    openReminderForm(): void {

        this.showNotifications = false;

        this.reminderSaved = false;

        this.savingReminder = false;


        /*
         * Reset form
         */

        this.reminder = {

            type: 'Birthday',

            customerName: '',

            date: '',

            time: '',

            guests: undefined,

            tableNumber: '',

            notes: '',

            remindBefore: '1 hour'

        };


        this.showReminderForm = true;

    }


    /* =========================================
       CLOSE REMINDER FORM
    ========================================== */

    closeReminderForm(): void {

        if (this.savingReminder) {

            return;

        }

        this.showReminderForm = false;

    }


    /* =========================================
       SAVE REMINDER
    ========================================== */

    saveReminder(): void {


        /* =====================================
           VALIDATION
        ===================================== */

        if (
            !this.reminder.type ||
            !this.reminder.customerName ||
            !this.reminder.date ||
            !this.reminder.time
        ) {

            alert(
                'Please fill all required fields.'
            );

            return;

        }


        /* =====================================
           START SAVING
        ===================================== */

        this.savingReminder = true;


        console.log(
            'Saving reminder:',
            this.reminder
        );


        this.reminderService
            .createReminder(this.reminder)
            .subscribe({

                next: (response) => {

                    console.log(
                        'Reminder saved:',
                        response
                    );


                    this.savingReminder =
                        false;


                    this.reminderSaved =
                        true;


                    /*
                     * Close after short delay
                     */

                    setTimeout(() => {

                        this.showReminderForm =
                            false;

                        this.reminderSaved =
                            false;

                    }, 1200);

                },


                error: (error) => {

                    console.error(
                        'Reminder save error:',
                        error
                    );


                    this.savingReminder =
                        false;


                    alert(
                        'Could not save reminder. Please check your backend.'
                    );

                }

            });

    }


    /* =========================================
       NOTIFICATION SOUND
    ========================================== */

    playNotificationSound(): void {

        try {

            const AudioContextClass =
                window.AudioContext ||
                (window as any).webkitAudioContext;


            const audioContext =
                new AudioContextClass();


            if (
                audioContext.state ===
                'suspended'
            ) {

                audioContext.resume();

            }


            const now =
                audioContext.currentTime;


            const masterGain =
                audioContext.createGain();


            masterGain.gain.setValueAtTime(
                0.8,
                now
            );


            masterGain.connect(
                audioContext.destination
            );


            /*
             * First tone
             */

            const oscillator1 =
                audioContext.createOscillator();


            const gain1 =
                audioContext.createGain();


            oscillator1.type =
                'square';


            oscillator1.frequency.setValueAtTime(
                880,
                now
            );


            gain1.gain.setValueAtTime(
                0.0001,
                now
            );


            gain1.gain.exponentialRampToValueAtTime(
                0.8,
                now + 0.02
            );


            gain1.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.18
            );


            oscillator1.connect(gain1);

            gain1.connect(masterGain);


            oscillator1.start(now);

            oscillator1.stop(
                now + 0.18
            );


            /*
             * Second tone
             */

            const oscillator2 =
                audioContext.createOscillator();


            const gain2 =
                audioContext.createGain();


            oscillator2.type =
                'square';


            oscillator2.frequency.setValueAtTime(
                1174,
                now + 0.20
            );


            gain2.gain.setValueAtTime(
                0.0001,
                now + 0.20
            );


            gain2.gain.exponentialRampToValueAtTime(
                0.8,
                now + 0.22
            );


            gain2.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.42
            );


            oscillator2.connect(gain2);

            gain2.connect(masterGain);


            oscillator2.start(
                now + 0.20
            );

            oscillator2.stop(
                now + 0.42
            );


        }

        catch (error) {

            console.warn(
                'Notification sound could not be played.',
                error
            );

        }

    }


    /* =========================================
       PAGE TITLE
    ========================================== */

    updateTitle(): void {

        const url =
            this.router.url;


        if (
            url.includes(
                '/admin/dashboard'
            )
        ) {

            this.title =
                'Dashboard';

        }

        else if (
            url.includes(
                '/admin/menu'
            )
        ) {

            this.title =
                'Menu Management';

        }

        else if (
            url.includes(
                '/admin/products'
            )
        ) {

            this.title =
                'Products';

        }

        else if (
            url.includes(
                '/admin/categories'
            )
        ) {

            this.title =
                'Categories';

        }

        else if (
            url.includes(
                '/kitchen/history'
            )
        ) {

            this.title =
                'Kitchen History';

        }

        else if (
            url.includes(
                '/kitchen'
            )
        ) {

            this.title =
                'Kitchen Orders';

        }

        else {

            this.title =
                'QR Cafe';

        }

    }


    /* =========================================
       DESTROY
    ========================================== */

    ngOnDestroy(): void {

        if (this.socket) {

            this.socket.disconnect();

        }

    }

}
