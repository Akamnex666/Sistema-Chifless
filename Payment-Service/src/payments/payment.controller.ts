import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto, PaymentResponseDto } from "../models/payment.dto";

@ApiTags("Payments")
@Controller("payments")
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a new payment
   * POST /payments/create
   */
  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({
    status: 201,
    description: "Payment created successfully",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid payment data" })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    try {
      // Validate required fields
      if (!createPaymentDto.orderId) {
        throw new BadRequestException("orderId is required");
      }
      if (!createPaymentDto.amount || createPaymentDto.amount <= 0) {
        throw new BadRequestException("amount must be greater than 0");
      }
      if (!createPaymentDto.currency) {
        throw new BadRequestException("currency is required");
      }

      return await this.paymentService.createPayment(createPaymentDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create payment: ${error.message}`,
      );
    }
  }

  /**
   * Confirm a payment
   * POST /payments/confirm
   */
  @Post("confirm")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm an existing payment" })
  @ApiResponse({
    status: 200,
    description: "Payment confirmed successfully",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found" })
  async confirmPayment(
    @Body("transactionId") transactionId: string,
    @Body("metadata") metadata?: Record<string, any>,
  ): Promise<PaymentResponseDto> {
    try {
      if (!transactionId) {
        throw new BadRequestException("transactionId is required");
      }

      return await this.paymentService.confirmPayment(transactionId, metadata);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to confirm payment: ${error.message}`,
      );
    }
  }

  /**
   * Get payment by ID
   * GET /payments/:id
   */
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiResponse({
    status: 200,
    description: "Payment found",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found" })
  async getPayment(
    @Param("id") paymentId: string,
  ): Promise<PaymentResponseDto> {
    try {
      return await this.paymentService.getPayment(paymentId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch payment: ${error.message}`,
      );
    }
  }

  /**
   * Get payment by transaction ID
   * GET /payments/transaction/:transactionId
   */
  @Get("transaction/:transactionId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get payment by transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Payment found",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found" })
  async getPaymentByTransactionId(
    @Param("transactionId") transactionId: string,
  ): Promise<PaymentResponseDto> {
    try {
      return await this.paymentService.getPaymentByTransactionId(transactionId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch payment: ${error.message}`,
      );
    }
  }

  /**
   * Refund a payment
   * POST /payments/refund
   */
  @Post("refund")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refund a payment" })
  @ApiResponse({
    status: 200,
    description: "Payment refunded successfully",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found" })
  async refundPayment(
    @Body("transactionId") transactionId: string,
    @Body("amount") amount?: number,
  ): Promise<PaymentResponseDto> {
    try {
      if (!transactionId) {
        throw new BadRequestException("transactionId is required");
      }

      return await this.paymentService.refundPayment(transactionId, amount);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to refund payment: ${error.message}`,
      );
    }
  }

  /**
   * Get all payments for an order
   * GET /payments/order/:orderId
   */
  @Get("order/:orderId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all payments for an order" })
  @ApiResponse({
    status: 200,
    description: "Payments found",
    type: [PaymentResponseDto],
  })
  async getPaymentsByOrderId(
    @Param("orderId") orderId: string,
  ): Promise<PaymentResponseDto[]> {
    try {
      return await this.paymentService.getPaymentsByOrderId(orderId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch payments: ${error.message}`,
      );
    }
  }
}
