"use client";

import { useState } from "react";

type Membro = {
  nome: string;
  cafeComLeite: boolean;
};

type Evento = {
  anfitriao: string;
  custoPresenca: number;
  custoFalta: number;
  participantes: Membro[];
  faltantes: Membro[];
};

export default function Home() {
  const [confraria, setConfraria] = useState<string>("Minha Confraria");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [saldo, setSaldo] = useState<number>(0);
  const [saldosMembros, setSaldosMembros] = useState<{ [key: string]: number }>({});

  const adicionarMembro = (nome: string, cafeComLeite: boolean = false) => {
    setMembros([...membros, { nome, cafeComLeite }]);
  };

  const adicionarEvento = (anfitriao: string, custoPresenca: number, custoFalta: number) => {
    setEventos([...eventos, { anfitriao, custoPresenca, custoFalta, participantes: [], faltantes: [] }]);
  };

  const registrarPresenca = (eventoIndex: number, membro: Membro) => {
    const novoEventos = [...eventos];
    novoEventos[eventoIndex].participantes.push(membro);
    setEventos(novoEventos);
    setSaldo(saldo + novoEventos[eventoIndex].custoPresenca);
    setSaldosMembros((prev: { [key: string]: number }) => ({
      ...prev,
      [membro.nome]: (prev[membro.nome] || 0) - novoEventos[eventoIndex].custoPresenca,
    }));
    
  };

  const registrarFalta = (eventoIndex: number, membro: Membro) => {
    if (membro.cafeComLeite) return;
    const novoEventos = [...eventos];
    novoEventos[eventoIndex].faltantes.push(membro);
    setEventos(novoEventos);
    setSaldo(saldo + novoEventos[eventoIndex].custoFalta);
    setSaldosMembros((prev) => ({
      ...prev,
      [membro.nome]: (prev[membro.nome] || 0) - novoEventos[eventoIndex].custoFalta,
    }));
  };

  const ajustarSaldoMembro = (membro: Membro, novoSaldo: number) => {
    setSaldosMembros((prev) => ({
      ...prev,
      [membro.nome]: novoSaldo,
    }));
  };

  const compartilharSaldo = (membro: Membro, incluirEventos: boolean) => {
    const saldo = saldosMembros[membro.nome] || 0;
    let mensagem = `${membro.nome}, seu saldo na confraria é de R$ ${saldo.toFixed(2)}.`;

    if (incluirEventos) {
      mensagem += "\n\nDetalhamento por evento:";
      eventos.forEach((evento: Evento, index: number) => {
        if (evento.participantes.includes(membro)) {
          mensagem += `\nEvento ${index + 1} (Presença): -R$ ${evento.custoPresenca}`;
        } else if (evento.faltantes.includes(membro)) {
          mensagem += `\nEvento ${index + 1} (Falta): -R$ ${evento.custoFalta}`;
        }
      });
    }

    navigator.clipboard.writeText(mensagem).then(() => {
      alert("Saldo copiado para a área de transferência!");
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{confraria}</h1>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Saldos dos Membros</h2>
        {membros.map((membro, index) => (
          <div key={index} className="mt-2 flex gap-2 items-center">
            <span>
              {membro.nome}: R$ {saldosMembros[membro.nome] || 0}
            </span>
            <button
              className="p-2 bg-blue-500 text-white rounded"
              onClick={() => compartilharSaldo(membro, true)}
            >
              Compartilhar Saldo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
