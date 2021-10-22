import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { STORAGE_KEYS, StorageService } from '../../cores/services/storage.service';
import { RegisterState, UserState } from '@features/auth/auth.model';
import { ApiService } from '../../cores/services/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserState>(
    this.storage.getObject(STORAGE_KEYS.USER) || null
  );
  currentUser = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticate());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private errorMsg = new BehaviorSubject<string>('');
  errorMsg$ = this.errorMsg.asObservable();

  constructor(
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly http: HttpClient,
    private readonly storage: StorageService,
    private readonly dialog: MatDialog
  ) {}

  isAuthenticate(): boolean {
    const token = this.storage.get(STORAGE_KEYS.TOKEN);
    return Boolean(token);
  }

  login(data: { email: string; password: string }) {
    return this.http
      .post('https://boiling-brook-88386.herokuapp.com/api/login', data)
      .pipe(
        catchError((err): any => {
          return this.handleError(err?.error);
        })
      )
      .subscribe(({ data }: any) => {
        const token = data.token;
        const user: UserState = {
          id: data.id,
          name: data.name,
          email: data.email,
        };
        this.storage.set(STORAGE_KEYS.TOKEN, token);
        this.isAuthenticatedSubject.next(true);
        // set currentUser
        this.setUser(user);
        if (this.router.url === '/cart') {
          this.router.navigate(['/checkout/success']);
        } else if (this.router.url === '/admin/login') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['']);
        }

        this.dialog.closeAll();
      });
  }

  register(data: RegisterState) {
    return this.http.post('https://boiling-brook-88386.herokuapp.com/api/register', data);
  }

  logout() {
    this.storage.clear();
    this.setAuthenticated(false);
    this.setUser(null);
    this.router.navigate(['']);
  }

  setUser(user: UserState | any) {
    this.currentUserSubject.next(user);
  }

  getUser() {
    return this.http.get('https://boiling-brook-88386.herokuapp.com/api/user-profile').pipe(
      catchError((err): any => {
        return this.handleError(err);
      })
    );
  }

  setAuthenticated(value: boolean) {
    this.isAuthenticatedSubject.next(value);
  }

  handleError(err: HttpErrorResponse) {
    if (err) {
      this.errorMsg.next(err?.error?.message);
    }
  }
}