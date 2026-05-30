export const translateError = (message: string): string => {
  const translations: Record<string, string> = {
    // Auth
    'These credentials do not match our records.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'The email has already been taken.': 'البريد الإلكتروني مسجل مسبقاً في النظام.',
    'The password field is required.': 'حقل كلمة المرور مطلوب.',
    'The email field is required.': 'حقل البريد الإلكتروني مطلوب.',
    'The email must be a valid email address.': 'يجب إدخال بريد إلكتروني صحيح.',
    
    // Workers & Users
    'The name field is required.': 'الاسم مطلوب ولا يمكن تركه فارغاً.',
    'The phone field is required.': 'رقم الهاتف مطلوب.',
    'The role field is required.': 'يرجى اختيار الصلاحية للمستخدم.',
    
    // Reports
    'The report_date field is required.': 'تاريخ التقرير مطلوب.',
    'The groups field must be an array.': 'يجب أن يحتوي التقرير على مجموعات عمل صالحة.',
    
    // Generic
    'The given data was invalid.': 'البيانات المدخلة غير صحيحة، يرجى مراجعتها.',
    'Unauthenticated.': 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.',
    'This action is unauthorized.': 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
  };

  // Check if we have an exact translation
  if (translations[message]) {
    return translations[message];
  }

  // If the message contains specific keywords, try to give a better fallback
  if (message.toLowerCase().includes('required')) {
    return 'أحد الحقول الإلزامية مفقود، يرجى ملء جميع الحقول المطلوبة.';
  }
  
  if (message.toLowerCase().includes('already been taken')) {
    return 'هذه البيانات مسجلة مسبقاً في النظام.';
  }

  // Return the original if no translation found, or a generic arabic message if you prefer
  return message; // or 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.'
};

export const getErrorMessage = (error: any): string => {
  // If no error object or response
  if (!error || !error.response) {
    return 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت.';
  }

  const { data } = error.response;

  // 1. Check for Laravel Validation Errors (422 Unprocessable Entity)
  // Laravel usually returns errors object: { field1: ['Error 1'], field2: ['Error 2'] }
  if (data?.errors && typeof data.errors === 'object') {
    // Get the first error of the first field
    const firstField = Object.keys(data.errors)[0];
    if (firstField && Array.isArray(data.errors[firstField]) && data.errors[firstField].length > 0) {
      return translateError(data.errors[firstField][0]);
    }
  }

  // 2. Check for general message
  if (data?.message) {
    return translateError(data.message);
  }

  // 3. Fallback
  return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.';
};
