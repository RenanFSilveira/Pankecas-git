"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { menuData, categoryNames, categoriesList, type MenuItem } from "@/lib/menu-data"

type ItemCarrinho = {
  produto: MenuItem
  quantidade: number
}

type FormularioCliente = {
  nome: string
  telefone: string
  endereco: string
  complemento: string
  retiradaNaLoja: boolean
  formaPagamento: "dinheiro" | "pix" | "cartao"
}

export function CardapioDigital() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos")
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formulario, setFormulario] = useState<FormularioCliente>({
    nome: "",
    telefone: "",
    endereco: "",
    complemento: "",
    retiradaNaLoja: false,
    formaPagamento: "dinheiro",
  })

  const categoriasRef = useRef<HTMLDivElement>(null)
  const secoesCategorias = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Atualizar a imagem do Penne ao Gorgonzola + Crispy
  useEffect(() => {
    const atualizarImagemPenne = () => {
      const penneItem = menuData.find((item) => item.id === 23)
      if (penneItem) {
        penneItem.image = "/penne-crispy.jpg"
      }
    }

    atualizarImagemPenne()
  }, [])

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto: MenuItem) => {
    setItensCarrinho((itens) => {
      const itemExistente = itens.find((item) => item.produto.id === produto.id)

      if (itemExistente) {
        return itens.map((item) =>
          item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        )
      } else {
        return [...itens, { produto, quantidade: 1 }]
      }
    })

    // Abrir o carrinho ao adicionar um item
    setCarrinhoAberto(true)
  }

  // Alterar quantidade de um item no carrinho
  const alterarQuantidade = (id: number, acao: "aumentar" | "diminuir") => {
    setItensCarrinho((itens) => {
      return itens.map((item) => {
        if (item.produto.id === id) {
          const novaQuantidade = acao === "aumentar" ? item.quantidade + 1 : Math.max(1, item.quantidade - 1)

          return { ...item, quantidade: novaQuantidade }
        }
        return item
      })
    })
  }

  // Remover item do carrinho
  const removerItem = (id: number) => {
    setItensCarrinho((itens) => itens.filter((item) => item.produto.id !== id))
  }

  // Calcular total do carrinho
  const calcularTotal = () => {
    return itensCarrinho.reduce((total, item) => {
      return total + item.produto.price * item.quantidade
    }, 0)
  }

  // Filtrar produtos por categoria
  const produtosFiltrados =
    categoriaAtiva === "todos" ? menuData : menuData.filter((produto) => produto.category === categoriaAtiva)

  // Atualizar formulário
  const atualizarFormulario = (campo: keyof FormularioCliente, valor: any) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }))
  }

  // Enviar pedido para WhatsApp
  const enviarPedido = () => {
    const { nome, telefone, endereco, complemento, retiradaNaLoja, formaPagamento } = formulario

    if (!nome || !telefone || (!retiradaNaLoja && !endereco)) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Construir mensagem do pedido
    let mensagem = `*Novo Pedido - Pankeca's*\n\n`
    mensagem += `*Cliente:* ${nome}\n`
    mensagem += `*Telefone:* ${telefone}\n`

    if (retiradaNaLoja) {
      mensagem += `*Retirada:* Na loja\n`
    } else {
      mensagem += `*Endereço:* ${endereco}\n`
      if (complemento) {
        mensagem += `*Complemento:* ${complemento}\n`
      }
    }

    mensagem += `*Forma de Pagamento:* ${
      formaPagamento === "dinheiro" ? "Dinheiro" : formaPagamento === "pix" ? "PIX" : "Cartão de Crédito/Débito"
    }\n\n`

    mensagem += `*Itens do Pedido:*\n`
    itensCarrinho.forEach((item) => {
      mensagem += `- ${item.quantidade}x ${item.produto.name} (R$ ${(item.produto.price * item.quantidade).toFixed(2)})\n`
    })

    mensagem += `\n*Total:* R$ ${calcularTotal().toFixed(2)}`

    // Codificar a mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem)

    // Número de telefone da loja (substitua pelo número real)
    const numeroWhatsApp = "5511999999999"

    // Criar URL do WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`

    // Abrir WhatsApp em nova janela
    window.open(urlWhatsApp, "_blank")
  }

  // Efeito para observar a rolagem e atualizar categoria ativa
  useEffect(() => {
    const observarSecoes = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const categoria = entry.target.getAttribute("data-categoria")
              if (categoria) {
                setCategoriaAtiva(categoria)
              }
            }
          })
        },
        { threshold: 0.5 },
      )

      Object.values(secoesCategorias.current).forEach((section) => {
        if (section) observer.observe(section)
      })

      return () => {
        Object.values(secoesCategorias.current).forEach((section) => {
          if (section) observer.unobserve(section)
        })
      }
    }

    const timer = setTimeout(observarSecoes, 500)
    return () => clearTimeout(timer)
  }, [])

  // Efeito para rolar para a categoria selecionada
  useEffect(() => {
    if (categoriaAtiva && secoesCategorias.current[categoriaAtiva]) {
      secoesCategorias.current[categoriaAtiva]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [categoriaAtiva])

  return (
    <div className="min-h-screen bg-[#FFF8E1] flex flex-col">
      {/* Header */}
      <header className="bg-[#8B4513] text-white p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Pankeca's Logo" width={180} height={60} className="h-10 w-auto" />
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFEEB2] rounded-full scale-125"></div>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-transparent"
            onClick={() => setCarrinhoAberto(!carrinhoAberto)}
          >
            <ShoppingCart className="h-6 w-6 text-[#8B4513]" />
            {itensCarrinho.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#8B4513] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {itensCarrinho.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-[#FFF8E1] py-16 px-4 text-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Image src="/PdePankecas.jpg" alt="Pankeca's Background" layout="fill" objectFit="cover" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-4">Uma escolha autêntica!</h1>
          <p className="text-lg text-[#8B4513]">Escolha suas favoritas e faça seu pedido</p>
        </div>
      </div>

      {/* Categorias */}
      <div
        ref={categoriasRef}
        className="sticky top-[72px] z-40 bg-[#FFF8E1] py-4 px-2 overflow-x-auto flex justify-center gap-2 shadow-md"
      >
        <div className="flex gap-2 font-['WinkyRough']">
          {categoriesList.map((categoria) => (
            <Button
              key={categoria}
              variant="outline"
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium font-['WinkyRough']",
                categoriaAtiva === categoria
                  ? "bg-[#8B4513] text-white hover:bg-[#6B3100]"
                  : "bg-[#E6D2B5] text-[#8B4513] hover:bg-[#D4C0A3]",
              )}
              onClick={() => setCategoriaAtiva(categoria)}
            >
              {categoryNames[categoria]}
            </Button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold text-center text-[#8B4513] mb-8">Cardápio</h1>

        {/* Mostrar todos os produtos quando "todos" estiver selecionado */}
        {categoriaAtiva === "todos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuData.map((produto) => (
              <Card key={produto.id} className="overflow-hidden flex flex-col h-full">
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={produto.image || "/placeholder.svg"}
                    alt={produto.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-[#8B4513] mb-2">{produto.name}</h2>
                  <p className="text-sm text-gray-600 mb-4 flex-1">{produto.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-lg font-bold text-[#8B4513]">R$ {produto.price.toFixed(2)}</span>
                    <Button onClick={() => adicionarAoCarrinho(produto)} className="bg-[#8B4513] hover:bg-[#6B3100]">
                      + Adicionar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Seções de Categorias */}
        {categoriaAtiva !== "todos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesList
              .filter((cat) => cat !== "todos")
              .map((categoria) => (
                <div
                  key={categoria}
                  ref={(el) => (secoesCategorias.current[categoria] = el)}
                  data-categoria={categoria}
                  className={cn("col-span-full", categoriaAtiva !== categoria && "hidden")}
                >
                  {menuData.filter((p) => p.category === categoria).length > 0 && (
                    <>
                      <h1 className="text-2xl font-bold text-[#8B4513] mb-4">{categoryNames[categoria]}</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {produtosFiltrados
                          .filter((produto) => produto.category === categoria)
                          .map((produto) => (
                            <Card key={produto.id} className="overflow-hidden flex flex-col h-full">
                              <div className="aspect-video w-full overflow-hidden">
                                <Image
                                  src={produto.image || "/placeholder.svg"}
                                  alt={produto.name}
                                  width={400}
                                  height={300}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h2 className="text-xl font-bold text-[#8B4513] mb-2">{produto.name}</h2>
                                <p className="text-sm text-gray-600 mb-4 flex-1">{produto.description}</p>
                                <div className="flex justify-between items-center mt-auto">
                                  <span className="text-lg font-bold text-[#8B4513]">
                                    R$ {produto.price.toFixed(2)}
                                  </span>
                                  <Button
                                    onClick={() => adicionarAoCarrinho(produto)}
                                    className="bg-[#8B4513] hover:bg-[#6B3100]"
                                  >
                                    + Adicionar
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Seção de Pedido */}
        <div className="mt-16 mb-8">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-6">Seu Pedido</h1>

          {itensCarrinho.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-400 mt-2">Adicione itens do cardápio para fazer seu pedido</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4">
              {itensCarrinho.map((item) => (
                <div key={item.produto.id} className="flex items-center py-4">
                  <div className="w-16 h-16 mr-4 overflow-hidden rounded-md">
                    <Image
                      src={item.produto.image || "/placeholder.svg"}
                      alt={item.produto.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-[#8B4513]">{item.produto.name}</h2>
                    <p className="text-sm text-gray-500">
                      R$ {item.produto.price.toFixed(2)} x {item.quantidade} = R${" "}
                      {(item.produto.price * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => alterarQuantidade(item.produto.id, "diminuir")}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 w-6 text-center">{item.quantidade}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => alterarQuantidade(item.produto.id, "aumentar")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2 text-red-500 hover:text-red-700"
                      onClick={() => removerItem(item.produto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-4 py-4 border-t flex justify-between items-center">
                <span className="font-bold text-lg">Total: R$ {calcularTotal().toFixed(2)}</span>
                <Button className="bg-[#8B4513] hover:bg-[#6B3100]" onClick={() => setMostrarFormulario(true)}>
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carrinho Lateral */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-3/4 sm:w-96 bg-white shadow-lg transform transition-transform z-50",
          carrinhoAberto ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-[#8B4513]">Seu Pedido</h3>
          <Button variant="ghost" size="icon" onClick={() => setCarrinhoAberto(false)}>
            &times;
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)] p-4">
          {itensCarrinho.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itensCarrinho.map((item) => (
                <div key={item.produto.id} className="flex items-center py-2 border-b">
                  <div className="w-16 h-16 mr-4 overflow-hidden rounded-md">
                    <Image
                      src={item.produto.image || "/placeholder.svg"}
                      alt={item.produto.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#8B4513]">{item.produto.name}</h4>
                    <p className="text-sm text-gray-500">
                      R$ {item.produto.price.toFixed(2)} x {item.quantidade} = R${" "}
                      {(item.produto.price * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => alterarQuantidade(item.produto.id, "diminuir")}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 w-6 text-center">{item.quantidade}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => alterarQuantidade(item.produto.id, "aumentar")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2 text-red-500 hover:text-red-700"
                      onClick={() => removerItem(item.produto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="mb-4 font-bold text-lg">Total: R$ {calcularTotal().toFixed(2)}</div>
          <Button
            className="w-full bg-[#8B4513] hover:bg-[#6B3100]"
            disabled={itensCarrinho.length === 0}
            onClick={() => {
              setCarrinhoAberto(false)
              setMostrarFormulario(true)
            }}
          >
            Finalizar Pedido
          </Button>
        </div>
      </div>

      {/* Modal de Formulário */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFF8E1] rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-[#8B4513]">Dados para Entrega</h3>
              <Button variant="ghost" size="icon" onClick={() => setMostrarFormulario(false)}>
                &times;
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formulario.nome}
                    onChange={(e) => atualizarFormulario("nome", e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formulario.telefone}
                    onChange={(e) => atualizarFormulario("telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formulario.endereco}
                    onChange={(e) => atualizarFormulario("endereco", e.target.value)}
                    placeholder="Rua, número, bairro"
                    disabled={formulario.retiradaNaLoja}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formulario.complemento}
                    onChange={(e) => atualizarFormulario("complemento", e.target.value)}
                    placeholder="Apartamento, bloco, referência"
                    disabled={formulario.retiradaNaLoja}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="retirada"
                    checked={formulario.retiradaNaLoja}
                    onCheckedChange={(checked) => atualizarFormulario("retiradaNaLoja", checked === true)}
                  />
                  <Label htmlFor="retirada">Retirada na loja</Label>
                </div>

                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <RadioGroup
                    value={formulario.formaPagamento}
                    onValueChange={(value) =>
                      atualizarFormulario("formaPagamento", value as "dinheiro" | "pix" | "cartao")
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dinheiro" id="dinheiro" />
                      <Label htmlFor="dinheiro">Dinheiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix">PIX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cartao" id="cartao" />
                      <Label htmlFor="cartao">Crédito / Débito</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" className="mr-2" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
              <Button className="bg-[#8B4513] hover:bg-[#6B3100]" onClick={enviarPedido}>
                Enviar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#8B4513] text-white p-4 text-center">
        <p>© {new Date().getFullYear()} Pankeca's - Todos os direitos reservados</p>
        <p className="mt-2 flex items-center justify-center">
          <a
            href="https://maps.app.goo.gl/T2o8k3id884UQo9U9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            <span className="mr-1">📍</span>
            <span>Ver localização</span>
          </a>
        </p>
      </footer>
    </div>
  )
}
