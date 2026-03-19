import type { Request, Response, NextFunction } from 'express';
export declare function list(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function show(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function create(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function send(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function cancel(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function creditNote(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function removePayment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addDeposit(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function issueDepositInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function sendByEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=invoices.controller.d.ts.map