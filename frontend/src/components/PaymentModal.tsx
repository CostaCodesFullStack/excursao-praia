import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { usePassenger, useRegisterPayment } from "@/hooks/usePassengers";
import { formatCurrency, formatDate } from "@/lib/utils";

type PaymentModalProps = {
  open: boolean;
  passengerId: string | null;
  onClose: () => void;
};

export default function PaymentModal({ open, passengerId, onClose }: PaymentModalProps) {
  const passengerQuery = usePassenger(passengerId, open);
  const registerPayment = useRegisterPayment();
  const currentPending = passengerQuery.data?.pending ?? 0;

  const schema = z.object({
    amount: z.coerce
      .number()
      .positive("Informe um valor maior que zero")
      .refine((value) => value <= currentPending, "Valor acima do saldo pendente"),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      amount: currentPending > 0 ? currentPending : 0,
    },
  });

  useEffect(() => {
    form.reset({
      amount: currentPending > 0 ? currentPending : 0,
    });
  }, [currentPending, form, passengerId]);

  const onSubmit = form.handleSubmit((values) => {
    if (!passengerId) {
      return;
    }

    registerPayment.mutate(
      {
        id: passengerId,
        payload: values,
      },
      {
        onSuccess: () => {
          toast.success("Pagamento registrado com sucesso");
          onClose();
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      },
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar recebimento"
      description="Cada recebimento cria um item no historico e atualiza o valor pago automaticamente."
    >
      {passengerQuery.isPending ? (
        <div className="space-y-4">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-48 w-full" />
        </div>
      ) : passengerQuery.data ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Passageiro</p>
              <p className="mt-2 text-base font-semibold text-foreground">{passengerQuery.data.name}</p>
              <p className="text-sm text-muted-foreground">Assento {passengerQuery.data.seat}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ja recebido</p>
              <p className="mt-2 text-base font-semibold text-foreground">{formatCurrency(passengerQuery.data.paid)}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saldo pendente</p>
              <p className="mt-2 text-base font-semibold text-foreground">{formatCurrency(passengerQuery.data.pending)}</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Valor recebido agora"
              type="number"
              min="0"
              step="0.01"
              error={form.formState.errors.amount?.message}
              {...form.register("amount")}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={registerPayment.isPending}
                disabled={passengerQuery.data.pending <= 0 || !form.formState.isValid}
              >
                Confirmar recebimento
              </Button>
            </div>
          </form>

          <section className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Historico de pagamentos</h3>
              <p className="text-sm text-muted-foreground">As entradas mais recentes aparecem primeiro.</p>
            </div>

            {passengerQuery.data.payments?.length ? (
              <div className="overflow-hidden rounded-3xl border border-border/70">
                <table className="min-w-full divide-y divide-border/70 text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Data</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {passengerQuery.data.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.paidAt)}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="panel-muted p-4 text-sm text-muted-foreground">Nenhum pagamento registrado ate agora.</div>
            )}
          </section>
        </div>
      ) : (
        <div className="panel-muted p-4 text-sm text-muted-foreground">Nao foi possivel carregar este passageiro.</div>
      )}
    </Modal>
  );
}

