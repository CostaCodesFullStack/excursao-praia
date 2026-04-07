import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import Button from "@/components/ui/Button";
import Input, { inputClasses } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useCreatePassenger, useUpdatePassenger } from "@/hooks/usePassengers";
import { cn, formatCurrency } from "@/lib/utils";
import type { Passenger } from "@/types";

type PassengerFormModalProps = {
  open: boolean;
  onClose: () => void;
  passenger?: Passenger | null;
  initialSeat?: number | null;
  onRegisterPayment?: (passengerId: string) => void;
};

const schema = z
  .object({
    name: z.string().trim().min(1, "Nome obrigatorio"),
    phone: z.string().optional(),
    seat: z.coerce.number().int().min(1, "Assento deve ser entre 1 e 50").max(50, "Assento deve ser entre 1 e 50"),
    total: z.coerce.number().min(0, "Valor total nao pode ser negativo"),
    paid: z.coerce.number().min(0, "Valor pago nao pode ser negativo"),
    notes: z.string().optional(),
  })
  .superRefine((data, context) => {
    if (data.paid > data.total) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paid"],
        message: "Valor pago nao pode ser maior que o valor total",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function getDefaultValues(passenger?: Passenger | null, initialSeat?: number | null): FormValues {
  if (passenger) {
    return {
      name: passenger.name,
      phone: passenger.phone ?? "",
      seat: passenger.seat,
      total: passenger.total,
      paid: passenger.paid,
      notes: passenger.notes ?? "",
    };
  }

  return {
    name: "",
    phone: "",
    seat: initialSeat ?? 1,
    total: 0,
    paid: 0,
    notes: "",
  };
}

export default function PassengerFormModal({
  open,
  onClose,
  passenger,
  initialSeat,
  onRegisterPayment,
}: PassengerFormModalProps) {
  const createPassenger = useCreatePassenger();
  const updatePassenger = useUpdatePassenger();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: getDefaultValues(passenger, initialSeat),
  });

  useEffect(() => {
    form.reset(getDefaultValues(passenger, initialSeat));
  }, [passenger, initialSeat, open, form]);

  const currentValues = form.watch();
  const pending = Math.max(Number(currentValues.total || 0) - Number(currentValues.paid || 0), 0);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      phone: values.phone?.trim() || "",
      notes: values.notes?.trim() || "",
    };

    const action = passenger
      ? updatePassenger.mutateAsync({ id: passenger.id, payload })
      : createPassenger.mutateAsync(payload);

    action
      .then(() => {
        toast.success(passenger ? "Passageiro atualizado com sucesso" : "Passageiro cadastrado com sucesso");
        onClose();
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);

        if (message.toLowerCase().includes("assento")) {
          form.setError("seat", { message });
        }

        toast.error(message);
      });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={passenger ? "Editar passageiro" : "Novo passageiro"}
      description={passenger ? "Atualize os dados e o status sera recalculado no backend." : "O assento selecionado ja vem preenchido para agilizar o cadastro."}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome completo" error={form.formState.errors.name?.message} placeholder="Ex.: Maria de Souza" {...form.register("name")} />
          <Input label="Telefone / WhatsApp" error={form.formState.errors.phone?.message} placeholder="(11) 99999-0000" {...form.register("phone")} />
          <Input label="Assento" type="number" min="1" max="50" error={form.formState.errors.seat?.message} {...form.register("seat")} />
          <Input label="Valor total" type="number" min="0" step="0.01" error={form.formState.errors.total?.message} {...form.register("total")} />
          <Input label="Valor ja pago" type="number" min="0" step="0.01" error={form.formState.errors.paid?.message} {...form.register("paid")} />
          <div className="panel-muted flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Saldo calculado</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(pending)}</p>
            </div>
            {passenger && onRegisterPayment ? (
              <Button
                variant="ghost"
                className="rounded-2xl"
                icon={<CreditCard className="h-4 w-4" />}
                onClick={() => onRegisterPayment(passenger.id)}
              >
                Recebimento
              </Button>
            ) : null}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Observacoes</span>
          <textarea
            rows={4}
            className={cn(
              inputClasses,
              "resize-none",
              form.formState.errors.notes && "border-danger focus:ring-danger/10",
            )}
            placeholder="Anote combinados, ponto de embarque ou observacoes importantes."
            {...form.register("notes")}
          />
          {form.formState.errors.notes?.message ? (
            <span className="text-sm text-danger">{form.formState.errors.notes.message}</span>
          ) : null}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={createPassenger.isPending || updatePassenger.isPending}
            disabled={!form.formState.isValid}
          >
            {passenger ? "Salvar alteracoes" : "Cadastrar passageiro"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
