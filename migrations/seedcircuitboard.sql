INSERT into circuitboards (id ,
name,
ports)
Values(0,'pi pico','[GP0,GP1,GP2,GP3,GP4,GP5,GP6,GP7,GP7,GP8,GP9,GP10,GP11,GP12,GP13,GP14,GP15,GP16,GP17,GP18,GP19,GP20,GP21,GP22]');

Update keyboards
Set layout = '["13-2","14-15","27-15","28-175","40-0","41-225","42-225","43-0","54-0","55-275","56-125","57-125","58-125","59-0","60-0","61-0","62-625","63-0","64-0","65-0","66-125","67-125","68-125","69-125"]'
Where id = 0;
