# 🌌 Stargate SG-1 Simulator

Simulador interativo completo do Stargate baseado na série Stargate SG-1, com DHD (Dial Home Device) funcional, física de wormhole, e destinos conhecidos da série.

## 🚀 Características

### Interface Completa
- **Stargate Visual**: Renderização em Canvas com anel de símbolos e chevrons
- **DHD Interativo**: 39 símbolos para discagem manual
- **Painel de Status**: Monitoramento em tempo real de energia, chevrons e destino
- **Console de Eventos**: Log detalhado de todas as operações

### Funcionalidades

#### Sistema de Discagem
- Seleção manual de símbolos via DHD
- Discagem rápida de destinos conhecidos
- Validação de endereços (7 chevrons intra-galácticos, 8 inter-galácticos)
- Sequência de travamento de chevrons com animações

#### Física do Wormhole
- Vórtice de eventos (Kawoosh) com efeito visual
- Horizonte de eventos estável após formação
- Tempo de conexão: 38 minutos (simulado em 38 segundos)
- Fechamento automático após expiração

#### Destinos Conhecidos
1. **Abydos** (P8X-873) - 2,000 anos-luz
2. **Chulak** (P3X-513) - 12,000 anos-luz
3. **Tollana** (P3X-7763) - 8,500 anos-luz
4. **Atlantis** (Pegasus) - 3 milhões de anos-luz [8 chevrons]
5. **P3X-888** (Apophis) - 15,000 anos-luz
6. **Othala** (P5S-381) - 45,000 anos-luz

#### Controles de Segurança
- **Iris**: Proteção contra invasões (abre/fecha)
- **Reset**: Limpa endereço selecionado
- **Emergência**: Desligamento total do sistema

## 📖 Como Usar

### Método 1: Discagem Manual
1. Clique em 7 símbolos no DHD para formar um endereço
2. Pressione o botão laranja "ATIVAR" no centro do DHD
3. Observe a sequência de travamento dos chevrons
4. Se o endereço for válido, o wormhole será estabelecido

### Método 2: Discagem Rápida
1. Clique em um destino conhecido na lista à direita
2. O endereço será preenchido automaticamente
3. Pressione "ATIVAR" para conectar

### Controles
- **Reset**: Limpa o endereço atual (fecha gate se ativo)
- **Iris**: Alterna proteção (aberto/fechado)
- **Emergência**: Desligamento total + fecha iris

## 🎮 Endereços para Testar

```
Abydos:    27-7-15-32-12-30-1
Chulak:    9-2-23-15-37-20-1
Tollana:   11-26-5-38-14-19-1
Atlantis:  18-20-1-15-14-7-19-8 (8 chevrons)
P3X-888:   6-16-8-3-26-33-1
Othala:    28-13-35-22-4-25-1
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Animações, gradientes, glassmorphism
- **JavaScript Vanilla**: Lógica de simulação
- **Canvas API**: Renderização do Stargate

## 📊 Especificações Técnicas (Fictícias)

### Energia
- Intra-galáctica (7 chevrons): 800 MW
- Inter-galáctica (8 chevrons): 2.1 GW
- Destiny (9 chevrons): 3.5 GW

### Materiais
- Naquadah: 45,000 kg
- Trinium: 8,000 kg
- Naquadria: 120 kg
- Cristais de controle: 36 unidades

### Dimensões
- Diâmetro do anel: 6.7 metros
- Peso total: ~64,000 kg
- Símbolos: 39 constelações

## 🎨 Design

Interface moderna com:
- Paleta de cores sci-fi (azul ciano, laranja, verde)
- Efeitos de glow e sombras
- Animações suaves e responsivas
- Feedback visual para todas as ações

## 🔧 Instalação

1. Clone ou baixe os arquivos
2. Abra `index.html` em um navegador moderno
3. Não requer servidor - funciona localmente!

## 🌟 Recursos Futuros (Possíveis Melhorias)

- [ ] Efeitos sonoros (chevron lock, kawoosh, etc.)
- [ ] Mais destinos da série
- [ ] Modo 8 e 9 chevrons funcionais
- [ ] Animação 3D do wormhole
- [ ] Sistema de GDO (códigos de identificação)
- [ ] Histórico de discagens
- [ ] Modo multiplayer (incoming wormhole)

## 📝 Notas

Este é um projeto **puramente educacional e de entretenimento**, baseado na série Stargate SG-1. Todos os conceitos técnicos são fictícios e não representam física real.

## 🎬 Referências

- Série: Stargate SG-1 (1997-2007)
- Criadores: Brad Wright e Jonathan Glassner
- Universo: Stargate (MGM)

---

**Desenvolvido com ❤️ para fãs de Stargate**

*"Indeed." - Teal'c*
