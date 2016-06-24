# Free park function
import datetime as dt
def free_parking(d):
    # holiday (skip and if on sunday skip mon)
    holiday = ['01-01', '07-04', '11-11', '12-25']
    d_str = d.strftime('%m-%d')
    if d_str in holiday:
        return 'holiday'
    mon_after = (d - dt.timedelta(days=1)).strftime('%m-%d')
    if mon_after in holiday and d.weekday() == 0:
        return 'mon after sun holiday'
    # Any Sunday
    if d.weekday() == 6:
        return 'sunday'
    # 3rd Mon Feb and Jan (mlk and pres day)
    elif d.weekday() == 0 and 14 < d.day < 22 and 1 <= d.month <= 2:
        return 'mlk / pres day'
    # Last Mon of may (memorial)
    elif d.weekday() == 0 and 21 < d.day < 32 and d.month == 5:
        return 'memorial day'
    # 1st Mon sept (labor)
    elif d.weekday() == 0 and 0 < d.day < 8 and d.month == 9:
        return 'labor day'
    # 4th Thurs Nov (thanksgiving)
    elif d.weekday() == 3 and 21 < d.day < 29 and d.month == 11:
        return 'thanksgiving day'
    else:
        return ''
