export interface RequestChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  receiveEmailNotifications: boolean;
  receiveMonthlyExpenseReport: boolean;
  receiveWeeklyExpenseReport: boolean;
  receiveBiweeklyExpenseReport: boolean;
  sendWeeklyTransactionBackup: boolean;
  changePassword?: RequestChangePassword | null; 
}


export interface ProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  receiveEmailNotifications: boolean;
  receiveMonthlyExpenseReport: boolean;
  receiveWeeklyExpenseReport: boolean;
  receiveBiweeklyExpenseReport: boolean;
  sendWeeklyTransactionBackup: boolean;
}