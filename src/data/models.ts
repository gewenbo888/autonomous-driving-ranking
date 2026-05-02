export type ScoreKey = "tech" | "commercial" | "safety" | "scalability" | "data";

export const SCORE_WEIGHTS: Record<ScoreKey, number> = {
  tech: 0.25,
  commercial: 0.25,
  safety: 0.20,
  scalability: 0.15,
  data: 0.15,
};

export const SCORE_LABELS_EN: Record<ScoreKey, string> = {
  tech: "Tech Capability",
  commercial: "Commercial Deployment",
  safety: "Safety Record",
  scalability: "Scalability & Business Model",
  data: "Data Advantage",
};

export const SCORE_LABELS_ZH: Record<ScoreKey, string> = {
  tech: "技术能力",
  commercial: "商业化落地",
  safety: "安全记录",
  scalability: "可扩展性与商业模式",
  data: "数据优势",
};

export type Tier = "Leaders" | "Contenders" | "Challengers" | "Followers";

export const TIER_LABELS_EN: Record<Tier, string> = {
  Leaders: "Leaders",
  Contenders: "Contenders",
  Challengers: "Challengers",
  Followers: "Followers",
};

export const TIER_LABELS_ZH: Record<Tier, string> = {
  Leaders: "领跑者",
  Contenders: "挑战者",
  Challengers: "追赶者",
  Followers: "跟随者",
};

export interface AIModel {
  id: string;
  name: string;
  company: string;
  company_zh: string;
  releaseDate: string;
  scores: Record<ScoreKey, number>;
  description: string;
  description_zh: string;
  tags: string[];
  contextWindow: string;     // → repurposed: deployment cities/markets count
  pricing: string;            // → repurposed: business model
  flag: string;
  homepage?: string;
  history?: { date: string; total: number }[];
}

export function totalScore(scores: Record<ScoreKey, number>): number {
  let s = 0;
  for (const k of Object.keys(SCORE_WEIGHTS) as ScoreKey[]) {
    s += scores[k] * SCORE_WEIGHTS[k];
  }
  return Math.round(s * 10) / 10;
}

export function tierFor(total: number): Tier {
  if (total >= 85) return "Leaders";
  if (total >= 75) return "Contenders";
  if (total >= 65) return "Challengers";
  return "Followers";
}

const _models: AIModel[] = [
  // === LEADERS ===
  {
    id: "waymo",
    name: "Waymo",
    company: "Alphabet",
    company_zh: "Alphabet（谷歌母公司）",
    releaseDate: "2009 (Google Self-Driving)",
    scores: { tech: 95, commercial: 92, safety: 88, scalability: 78, data: 92 },
    description: "Industry pacesetter. 100M+ paid robotaxi rider miles across Phoenix, San Francisco, Los Angeles, Austin, Atlanta. Custom Driver platform on Geely Zeekr + Hyundai Ioniq 5. Most validated L4 stack in the field.",
    description_zh: "行业引领者。在凤凰城、旧金山、洛杉矶、奥斯汀、亚特兰大累计 1 亿+ 商用 Robotaxi 乘客里程。自研 Driver 平台搭载于吉利极氪与现代 IONIQ 5。业界最经过验证的 L4 全栈。",
    tags: ["L4 robotaxi", "leader", "multi-city", "us-flagship"],
    contextWindow: "5+ cities",
    pricing: "Robotaxi service",
    flag: "🇺🇸",
    homepage: "https://waymo.com",
  },
  {
    id: "nvidia-drive",
    name: "NVIDIA DRIVE",
    company: "NVIDIA",
    company_zh: "英伟达",
    releaseDate: "2015 (DRIVE PX)",
    scores: { tech: 92, commercial: 88, safety: 82, scalability: 95, data: 78 },
    description: "Compute platform powering Mercedes-Benz, JLR, Volvo, Lucid, NIO, BYD, XPeng AV stacks. Hyperion 9 reference architecture (Thor SoC). Doesn't operate vehicles — supplies the brain.",
    description_zh: "为奔驰、捷豹路虎、沃尔沃、Lucid、蔚来、比亚迪、小鹏等提供 AV 计算平台。Hyperion 9 参考架构（Thor 芯片）。不直接运营车辆——提供「大脑」。",
    tags: ["platform", "supplier", "leader", "compute"],
    contextWindow: "30+ OEM customers",
    pricing: "Chip + platform license",
    flag: "🇺🇸",
    homepage: "https://nvidia.com/drive",
  },
  {
    id: "mobileye",
    name: "Mobileye",
    company: "Intel (NASDAQ:MBLY)",
    company_zh: "英特尔旗下（NASDAQ:MBLY）",
    releaseDate: "1999",
    scores: { tech: 88, commercial: 80, safety: 85, scalability: 90, data: 85 },
    description: "Perception and ADAS leader. EyeQ chips ship in 100M+ vehicles. Mobileye Drive is the L4 system; Chauffeur (eyes-off) launching in Volkswagen ID.Buzz + Audi. REM crowdsourced HD mapping is a unique data moat.",
    description_zh: "感知与 ADAS 领头羊。EyeQ 芯片已在 1 亿+ 辆车上量产。Mobileye Drive 为其 L4 系统；Chauffeur（眼睛可离开方向盘级）即将搭载大众 ID.Buzz 与奥迪。REM 众包高精地图是其独特数据护城河。",
    tags: ["leader", "supplier", "perception", "rem-mapping"],
    contextWindow: "100M+ vehicles",
    pricing: "Tier-1 supplier",
    flag: "🇮🇱",
    homepage: "https://mobileye.com",
  },
  {
    id: "baidu-apollo",
    name: "Baidu Apollo",
    company: "Baidu (NASDAQ:BIDU)",
    company_zh: "百度（NASDAQ:BIDU）",
    releaseDate: "2017 (Apollo open-source)",
    scores: { tech: 86, commercial: 88, safety: 82, scalability: 80, data: 88 },
    description: "China's robotaxi flagship. Apollo Go operates in Wuhan (largest L4 fleet), Beijing, Chongqing, Shanghai, Guangzhou, Shenzhen. 6th-gen vehicle (RT6) at $28K BoM — the lowest cost-per-vehicle in the L4 industry.",
    description_zh: "中国 Robotaxi 旗舰。萝卜快跑（Apollo Go）在武汉（中国最大 L4 车队）、北京、重庆、上海、广州、深圳运营。第六代车型（RT6）BoM 仅 2.8 万美元——业界 L4 单车最低成本。",
    tags: ["leader", "robotaxi", "chinese-flagship", "low-cost-l4"],
    contextWindow: "10+ CN cities",
    pricing: "Robotaxi service",
    flag: "🇨🇳",
    homepage: "https://apollo.auto",
  },
  // === CONTENDERS ===
  {
    id: "momenta",
    name: "Momenta",
    company: "Momenta · Private",
    company_zh: "Momenta · 未上市",
    releaseDate: "2016",
    scores: { tech: 82, commercial: 80, safety: 78, scalability: 90, data: 85 },
    description: "Suzhou-based supplier. ADAS + L2/L3 highway+city NOA stack powering NIO, Mercedes-Benz China, GAC, Toyota CN. Two-stage strategy: monetize ADAS at OEM scale today, build L4 R&D in parallel.",
    description_zh: "总部苏州的供应商。其 ADAS + L2/L3 高速与城市 NOA 全栈服务于蔚来、奔驰中国、广汽、丰田中国。「两条腿走路」：今天靠 OEM 规模 ADAS 变现，并行投入 L4 研发。",
    tags: ["contender", "supplier", "chinese", "oem-scale"],
    contextWindow: "Multi-OEM",
    pricing: "Tier-1 supplier",
    flag: "🇨🇳",
    homepage: "https://momenta.cn",
  },
  {
    id: "horizon",
    name: "Horizon Robotics",
    company: "Horizon (HKEX:9660)",
    company_zh: "地平线（港股:9660）",
    releaseDate: "2015",
    scores: { tech: 82, commercial: 85, safety: 78, scalability: 92, data: 75 },
    description: "China's leading ADAS chip designer. Journey 5 / Journey 6 SoCs power BYD, Li Auto, Audi China, NIO, Chery — millions of vehicles. SuperDrive full-stack ADAS rolling out in 2025-2026.",
    description_zh: "中国领先的 ADAS 芯片设计公司。征程 5/6 芯片搭载于比亚迪、理想、奥迪中国、蔚来、奇瑞——数百万辆车。SuperDrive 全栈 ADAS 于 2025-2026 推向市场。",
    tags: ["contender", "supplier", "chinese", "chip"],
    contextWindow: "Millions of vehicles",
    pricing: "Chip + platform",
    flag: "🇨🇳",
    homepage: "https://horizon.cc",
  },
  {
    id: "tesla",
    name: "Tesla FSD / Cybercab",
    company: "Tesla (NASDAQ:TSLA)",
    company_zh: "特斯拉（NASDAQ:TSLA）",
    releaseDate: "2014 (Autopilot)",
    scores: { tech: 80, commercial: 70, safety: 60, scalability: 95, data: 98 },
    description: "Vision-only end-to-end neural stack (FSD v13). Cybercab (purpose-built robotaxi) unveiled October 2024, production targeted 2026. Largest real-world driving dataset by 100×; unmatched fleet-collected miles. Safety record under sustained NHTSA scrutiny.",
    description_zh: "纯视觉端到端神经网络（FSD v13）。Cybercab（专为 Robotaxi 设计）于 2024 年 10 月发布，量产目标 2026 年。全球最大的真实驾驶数据集（领先 100 倍以上）；车队数据采集里程无人能敌。安全记录持续受 NHTSA 调查。",
    tags: ["contender", "vision-only", "data-king", "cybercab"],
    contextWindow: "Global fleet",
    pricing: "Owner FSD subscription",
    flag: "🇺🇸",
    homepage: "https://tesla.com/AI",
  },
  {
    id: "pony-ai",
    name: "Pony.ai",
    company: "Pony.ai (NASDAQ:PONY)",
    company_zh: "小马智行（NASDAQ:PONY）",
    releaseDate: "2016",
    scores: { tech: 84, commercial: 80, safety: 80, scalability: 75, data: 82 },
    description: "Robotaxi (PonyPilot+) in Beijing, Guangzhou, Shenzhen, Hong Kong + autonomous trucking (PonyTron). NASDAQ IPO Nov 2024. Extending to UAE (Abu Dhabi), South Korea, Saudi Arabia.",
    description_zh: "Robotaxi（PonyPilot+）覆盖北京、广州、深圳、香港 + 自动驾驶卡车（PonyTron）。2024 年 11 月纳斯达克上市。海外扩张至阿联酋（阿布扎比）、韩国、沙特。",
    tags: ["contender", "robotaxi", "trucking", "chinese", "listed"],
    contextWindow: "5+ cities",
    pricing: "Robotaxi + B2B",
    flag: "🇨🇳",
    homepage: "https://pony.ai",
  },
  {
    id: "aurora",
    name: "Aurora Innovation",
    company: "Aurora (NASDAQ:AUR)",
    company_zh: "Aurora（NASDAQ:AUR）",
    releaseDate: "2017",
    scores: { tech: 84, commercial: 75, safety: 82, scalability: 75, data: 78 },
    description: "Trucking-focused. Aurora Driver-as-a-Service launched commercially Apr 2025 on Dallas-Houston route with FedEx, Werner, Hirschbach. Strategic with Continental for hardware mass production.",
    description_zh: "聚焦自动驾驶卡车。Aurora Driver 即服务于 2025 年 4 月在达拉斯-休斯顿干线商业化首发，合作 FedEx、Werner、Hirschbach。与大陆集团联手量产硬件。",
    tags: ["contender", "trucking", "us-listed"],
    contextWindow: "TX freight corridors",
    pricing: "Driver-as-a-Service",
    flag: "🇺🇸",
    homepage: "https://aurora.tech",
  },
  {
    id: "weride",
    name: "WeRide",
    company: "WeRide (NASDAQ:WRD)",
    company_zh: "文远知行（NASDAQ:WRD）",
    releaseDate: "2017",
    scores: { tech: 82, commercial: 78, safety: 78, scalability: 76, data: 78 },
    description: "Multi-platform: Robotaxi, Robobus, Robovan, Robosanitation, Robosweeper. Operating in Guangzhou, Beijing + UAE (Abu Dhabi commercial), Singapore, Saudi Arabia. NASDAQ IPO Oct 2024.",
    description_zh: "多平台：Robotaxi、Robobus、Robovan、Robosanitation、Robosweeper。运营覆盖广州、北京 + 阿联酋（阿布扎比商业化）、新加坡、沙特。2024 年 10 月纳斯达克上市。",
    tags: ["contender", "multi-platform", "chinese", "international"],
    contextWindow: "5+ countries",
    pricing: "Robotaxi + B2G",
    flag: "🇨🇳",
    homepage: "https://weride.ai",
  },
  {
    id: "xpeng-xngp",
    name: "XPeng XNGP",
    company: "XPeng (HKEX:9868 · NYSE:XPEV)",
    company_zh: "小鹏（港股:9868 · 美股:XPEV）",
    releaseDate: "2023 (XNGP city-NOA)",
    scores: { tech: 84, commercial: 78, safety: 75, scalability: 70, data: 78 },
    description: "OEM-captive ADAS team building XNGP city-NOA. Highest-rated CN OEM ADAS by 2025 third-party benchmarks. Recently moved to E2E vision foundation model architecture.",
    description_zh: "整车厂自研团队，开发 XNGP 城市领航辅助。2025 年第三方评测中表现最佳的中国 OEM ADAS。已转向端到端视觉基础模型架构。",
    tags: ["contender", "oem-captive", "chinese", "e2e"],
    contextWindow: "200+ CN cities",
    pricing: "Vehicle-bundled",
    flag: "🇨🇳",
    homepage: "https://xpeng.com",
  },
  {
    id: "wayve",
    name: "Wayve",
    company: "Wayve · Private (SoftBank, NVIDIA, Microsoft)",
    company_zh: "Wayve · 未上市（软银、英伟达、微软投资）",
    releaseDate: "2017",
    scores: { tech: 86, commercial: 60, safety: 72, scalability: 82, data: 75 },
    description: "London-based. Pure end-to-end vision-language driving model (LingoT V3). Raised $1.05B Series C 2024 — largest UK AI raise. PILOT-ADP partnerships with Uber, Asda, Ocado.",
    description_zh: "总部伦敦。纯端到端视觉-语言驾驶模型（LingoT V3）。2024 年 C 轮融资 10.5 亿美元——英国 AI 史上最大融资。PILOT-ADP 合作伙伴 Uber、Asda、Ocado。",
    tags: ["contender", "e2e-foundation-model", "uk", "frontier"],
    contextWindow: "UK + global pilots",
    pricing: "Platform + partnerships",
    flag: "🇬🇧",
    homepage: "https://wayve.ai",
  },
  {
    id: "didi-av",
    name: "DiDi Autonomous Driving",
    company: "DiDi (OTC:DIDIY)",
    company_zh: "滴滴自动驾驶（OTC:DIDIY）",
    releaseDate: "2019",
    scores: { tech: 78, commercial: 70, safety: 72, scalability: 78, data: 75 },
    description: "Spun out of DiDi rideshare in 2019. Robotaxi service in Shanghai (Jiading). Deep partnership with GAC: co-developed L4 vehicle. Network advantage from parent rideshare app (>500M users).",
    description_zh: "2019 年从滴滴出行独立。Robotaxi 在上海嘉定运营。与广汽深度合作，联合开发 L4 整车。母公司出行 App（5 亿+ 用户）带来流量优势。",
    tags: ["contender", "robotaxi", "network-effect", "chinese"],
    contextWindow: "Shanghai pilot",
    pricing: "Robotaxi via DiDi app",
    flag: "🇨🇳",
    homepage: "https://www.didiglobal.com/auto-driving",
  },
  {
    id: "autox",
    name: "AutoX",
    company: "AutoX · Private (Alibaba, Dongfeng)",
    company_zh: "AutoX · 未上市（阿里巴巴、东风投资）",
    releaseDate: "2016",
    scores: { tech: 80, commercial: 72, safety: 75, scalability: 70, data: 72 },
    description: "Shenzhen + Shanghai robotaxi (no safety driver since 2020 in Shenzhen Pingshan). Founded by ex-Princeton Professor Xiao Jianxiong. RoboTaxi Gen 5 hardware platform.",
    description_zh: "深圳与上海开展 Robotaxi（深圳坪山 2020 年起取消安全员）。由前普林斯顿教授肖健雄创立。第五代 RoboTaxi 硬件平台。",
    tags: ["contender", "robotaxi", "fully-driverless", "chinese"],
    contextWindow: "Shenzhen + Shanghai",
    pricing: "Robotaxi service",
    flag: "🇨🇳",
    homepage: "https://autox.ai",
  },
  {
    id: "kodiak",
    name: "Kodiak Robotics",
    company: "Kodiak · Private (going public via SPAC)",
    company_zh: "Kodiak · 未上市（SPAC 上市进行中）",
    releaseDate: "2018",
    scores: { tech: 80, commercial: 70, safety: 78, scalability: 75, data: 72 },
    description: "Trucking-only. Launched commercial driverless freight Texas-Oklahoma in late 2024. Atlas Energy (Permian Basin) is anchor customer for autonomous tankers.",
    description_zh: "专注卡车。2024 年末在德州-俄克拉荷马干线商业化无人货运。Atlas Energy（二叠纪盆地）为其自动罐车锚点客户。",
    tags: ["contender", "trucking", "us"],
    contextWindow: "TX/OK freight",
    pricing: "Driver-as-a-Service",
    flag: "🇺🇸",
    homepage: "https://kodiak.ai",
  },
  // === CHALLENGERS ===
  {
    id: "zoox",
    name: "Zoox",
    company: "Amazon (NASDAQ:AMZN)",
    company_zh: "亚马逊旗下（NASDAQ:AMZN）",
    releaseDate: "2014",
    scores: { tech: 82, commercial: 65, safety: 75, scalability: 68, data: 72 },
    description: "Purpose-built robotaxi (no steering wheel). Commercial launch in Las Vegas (Resorts World) Q4 2024; SF expansion 2025. Acquired by Amazon for $1.2B in 2020.",
    description_zh: "为 Robotaxi 量身定制（无方向盘）。2024 年第四季度在拉斯维加斯（Resorts World）商业化首发；2025 年扩展到旧金山。2020 年被亚马逊以 12 亿美元收购。",
    tags: ["challenger", "purpose-built", "us"],
    contextWindow: "Las Vegas + SF",
    pricing: "Robotaxi service",
    flag: "🇺🇸",
    homepage: "https://zoox.com",
  },
  {
    id: "gatik",
    name: "Gatik",
    company: "Gatik · Private (Koch, Innovation Endeavors)",
    company_zh: "Gatik · 未上市（Koch、Innovation Endeavors 投资）",
    releaseDate: "2017",
    scores: { tech: 72, commercial: 70, safety: 75, scalability: 75, data: 65 },
    description: "B2B middle-mile freight (DC-to-store). Walmart anchor since 2019; expanded to Loblaw (Canada), Tyson Foods. Fixed-route + repeatable model is cheaper to scale than robotaxi.",
    description_zh: "B2B 中段物流（仓配-门店）。2019 年起以沃尔玛为锚点；扩展至加拿大 Loblaw、Tyson Foods。固定路线、可复制模式较 Robotaxi 更易规模化。",
    tags: ["challenger", "middle-mile", "b2b"],
    contextWindow: "Multi-retail",
    pricing: "Driver-as-a-Service",
    flag: "🇺🇸",
    homepage: "https://gatik.ai",
  },
  {
    id: "deeproute",
    name: "DeepRoute.ai",
    company: "DeepRoute.ai · Private",
    company_zh: "元戎启行 · 未上市",
    releaseDate: "2019",
    scores: { tech: 78, commercial: 65, safety: 70, scalability: 70, data: 68 },
    description: "Shenzhen. End-to-end driving model (DeepRoute IO 2.0). Pivoted from Robotaxi to mass-market ADAS supplier — Chery, BYD partnerships. Cost-engineered ADAS strategy.",
    description_zh: "深圳。端到端驾驶模型（DeepRoute IO 2.0）。已从 Robotaxi 转型为大众市场 ADAS 供应商——合作奇瑞、比亚迪。极致成本优化的 ADAS 路线。",
    tags: ["challenger", "e2e", "supplier-pivot", "chinese"],
    contextWindow: "Multi-OEM",
    pricing: "Tier-1 supplier",
    flag: "🇨🇳",
    homepage: "https://deeproute.ai",
  },
  {
    id: "plus-ai",
    name: "Plus.ai",
    company: "Plus · Private",
    company_zh: "Plus · 未上市",
    releaseDate: "2016",
    scores: { tech: 75, commercial: 65, safety: 72, scalability: 70, data: 68 },
    description: "Trucking. PlusDrive L2+ supervised system shipping in production trucks today; SuperDrive L4 in development. Operations split US (Cupertino) + China (Suzhou).",
    description_zh: "卡车自动驾驶。PlusDrive L2+ 监督式系统已在量产卡车上搭载；SuperDrive L4 在研。业务分布美国（库比蒂诺）与中国（苏州）。",
    tags: ["challenger", "trucking", "l2-plus"],
    contextWindow: "US + CN",
    pricing: "OEM-bundled L2+",
    flag: "🇺🇸",
    homepage: "https://plus.ai",
  },
  {
    id: "toyota-woven",
    name: "Woven by Toyota",
    company: "Toyota (NYSE:TM)",
    company_zh: "丰田旗下（NYSE:TM）",
    releaseDate: "2018",
    scores: { tech: 75, commercial: 50, safety: 78, scalability: 70, data: 75 },
    description: "Toyota's mobility R&D arm. Arene OS (Toyota's automotive software platform) + Woven City living lab in Susono, Japan (opened 2024). Cautious, infrastructure-first approach.",
    description_zh: "丰田的出行研发部门。Arene OS（丰田汽车软件平台）+ 静冈裾野市的 Woven City 实景实验室（2024 年启用）。以基础设施优先的稳健路线。",
    tags: ["challenger", "oem-captive", "japan"],
    contextWindow: "Japan demo",
    pricing: "OEM internal",
    flag: "🇯🇵",
    homepage: "https://woven.toyota",
  },
  {
    id: "hyundai-42dot",
    name: "Hyundai 42dot",
    company: "Hyundai Motor Group",
    company_zh: "现代汽车集团",
    releaseDate: "2019",
    scores: { tech: 72, commercial: 60, safety: 75, scalability: 70, data: 70 },
    description: "Hyundai's in-house AV unit (acquired 42dot 2022). SDV (software-defined vehicle) platform for next-gen Hyundai-Kia-Genesis fleet. Pony.ai partnership in Korea.",
    description_zh: "现代自研 AV 部门（2022 年收购 42dot）。为下一代现代-起亚-捷尼赛思车队打造 SDV（软件定义汽车）平台。在韩国与小马智行合作。",
    tags: ["challenger", "oem-captive", "korea"],
    contextWindow: "Korea + JV",
    pricing: "OEM internal",
    flag: "🇰🇷",
    homepage: "https://42dot.ai",
  },
  {
    id: "may-mobility",
    name: "May Mobility",
    company: "May Mobility · Private (Toyota, BMW i Ventures)",
    company_zh: "May Mobility · 未上市（丰田、宝马 i Ventures 投资）",
    releaseDate: "2017",
    scores: { tech: 70, commercial: 70, safety: 75, scalability: 65, data: 65 },
    description: "Autonomous shuttles in Detroit, Ann Arbor, Sun City (AZ), Peachtree Corners (GA), Grand Rapids, Miami, Atlanta. Multi-Policy Decision Making (MPDM) architecture.",
    description_zh: "在底特律、安娜堡、太阳城（亚利桑那）、Peachtree Corners（佐治亚）、大急流城、迈阿密、亚特兰大运营自动驾驶接驳车。多策略决策（MPDM）架构。",
    tags: ["challenger", "shuttle", "us"],
    contextWindow: "7+ US cities",
    pricing: "Transport-as-Service",
    flag: "🇺🇸",
    homepage: "https://maymobility.com",
  },
  {
    id: "oxa",
    name: "Oxa",
    company: "Oxa (formerly Oxbotica) · Private",
    company_zh: "Oxa（前身 Oxbotica）· 未上市",
    releaseDate: "2014",
    scores: { tech: 75, commercial: 60, safety: 75, scalability: 65, data: 65 },
    description: "Oxford-spinout. Autonomy software for closed environments — airports (Heathrow), mines, ports. Strategic partnership with Beep + Sasaki for shuttle deployments.",
    description_zh: "牛津大学孵化。专注封闭环境自动驾驶软件——机场（希思罗）、矿区、港口。与 Beep + Sasaki 战略合作部署接驳车。",
    tags: ["challenger", "closed-env", "uk"],
    contextWindow: "Industrial sites",
    pricing: "Software license",
    flag: "🇬🇧",
    homepage: "https://oxa.tech",
  },
  {
    id: "nuro",
    name: "Nuro",
    company: "Nuro · Private (SoftBank, T. Rowe Price)",
    company_zh: "Nuro · 未上市（软银、T. Rowe Price 投资）",
    releaseDate: "2016",
    scores: { tech: 78, commercial: 50, safety: 72, scalability: 70, data: 70 },
    description: "Pivoted in 2024 from owned-fleet last-mile delivery to L4 autonomy platform licensing. Now positioned as a stack supplier rather than operator. Strong perception team retained.",
    description_zh: "2024 年从自营末端配送转型为 L4 自动驾驶平台授权。现定位为技术栈供应商而非运营商。核心感知团队保留。",
    tags: ["challenger", "platform-pivot", "us"],
    contextWindow: "Platform licensing",
    pricing: "Platform license",
    flag: "🇺🇸",
    homepage: "https://nuro.ai",
  },
  {
    id: "qcraft",
    name: "QCraft",
    company: "QCraft · Private",
    company_zh: "轻舟智航 · 未上市",
    releaseDate: "2019",
    scores: { tech: 72, commercial: 65, safety: 70, scalability: 65, data: 65 },
    description: "Suzhou. Robobus + Robotaxi development. Driven*1.0 ADAS launched as supplier strategy — pivoting to mass-market ADAS revenue similar to DeepRoute and Momenta.",
    description_zh: "苏州。Robobus + Robotaxi 双线开发。Driven*1.0 ADAS 转型供应商策略——与元戎启行、Momenta 类似，向大众市场 ADAS 营收转型。",
    tags: ["challenger", "supplier-pivot", "chinese"],
    contextWindow: "Multi-OEM CN",
    pricing: "Tier-1 supplier",
    flag: "🇨🇳",
    homepage: "https://www.qcraft.ai",
  },
  {
    id: "motional",
    name: "Motional",
    company: "Hyundai-Aptiv JV",
    company_zh: "现代-Aptiv 合资",
    releaseDate: "2020",
    scores: { tech: 75, commercial: 55, safety: 70, scalability: 60, data: 70 },
    description: "Las Vegas Lyft-network robotaxi (paused commercial 2024). Aptiv pulled back funding 2024; future uncertain. IONIQ 5 robotaxi platform tech remains valuable.",
    description_zh: "拉斯维加斯 Lyft 网络 Robotaxi（2024 年暂停商业服务）。Aptiv 2024 年缩减投资；未来不确定。IONIQ 5 Robotaxi 平台技术仍具价值。",
    tags: ["challenger", "scaled-back", "joint-venture"],
    contextWindow: "Las Vegas",
    pricing: "Robotaxi (paused)",
    flag: "🇺🇸",
    homepage: "https://motional.com",
  },
  // === FOLLOWERS ===
  {
    id: "cruise",
    name: "Cruise",
    company: "GM (NYSE:GM)",
    company_zh: "通用汽车（NYSE:GM）",
    releaseDate: "2013 · acquired by GM 2016",
    scores: { tech: 75, commercial: 35, safety: 50, scalability: 40, data: 75 },
    description: "Once a leader. Suspended driverless ops Oct 2023 after pedestrian dragging incident in SF; permits revoked. GM stopped robotaxi funding Dec 2024 — folded into GM personal AV roadmap. Talent largely departed.",
    description_zh: "曾是行业领跑者。2023 年 10 月旧金山行人拖拽事件后暂停无人驾驶运营，运营牌照被吊销。通用 2024 年 12 月停止 Robotaxi 投资——并入 GM 个人 AV 路线图。核心人才大量流失。",
    tags: ["follower", "scaled-back", "permit-revoked"],
    contextWindow: "Personal AV pivot",
    pricing: "Future OEM-bundle",
    flag: "🇺🇸",
    homepage: "https://getcruise.com",
  },
];

// Generate synthetic 6-quarter trend history for sparkline (replace with real data when available).
const _hist = (current: number) => {
  const months = ["2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4"];
  return months.map((date, i) => {
    const drift = (Math.sin(i * 1.3) * 2 + (5 - i) * 0.6);
    return { date, total: Math.max(40, Math.min(100, Math.round((current - drift) * 10) / 10)) };
  });
};

export const models: AIModel[] = _models.map((m) => ({
  ...m,
  history: _hist(totalScore(m.scores)),
}));

export type SortKey = "total" | ScoreKey | "release";

export function sortModels(arr: AIModel[], key: SortKey): AIModel[] {
  const copy = [...arr];
  if (key === "total") {
    copy.sort((a, b) => totalScore(b.scores) - totalScore(a.scores));
  } else if (key === "release") {
    copy.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  } else {
    copy.sort((a, b) => b.scores[key] - a.scores[key]);
  }
  return copy;
}

export function getCompanyStats(arr: AIModel[]) {
  // Repurposed: group by Tier instead of company
  const map = new Map<Tier, AIModel[]>();
  arr.forEach((m) => {
    const t = tierFor(totalScore(m.scores));
    const e = map.get(t) || [];
    e.push(m);
    map.set(t, e);
  });
  const tierOrder: Tier[] = ["Leaders", "Contenders", "Challengers", "Followers"];
  return tierOrder.map((tier) => {
    const arr = map.get(tier) || [];
    const avg = arr.length ? arr.reduce((s, m) => s + totalScore(m.scores), 0) / arr.length : 0;
    return {
      company: tier,
      company_zh: TIER_LABELS_ZH[tier],
      flag: tier === "Leaders" ? "🥇" : tier === "Contenders" ? "🥈" : tier === "Challengers" ? "🥉" : "·",
      count: arr.length,
      avg: Math.round(avg * 10) / 10,
      best: arr[0] || null,
      models: arr.sort((a, b) => totalScore(b.scores) - totalScore(a.scores)),
    };
  }).filter((s) => s.count > 0);
}

// Auto-generated tier badges and per-dimension leader badges
export function getBadges(arr: AIModel[]): Map<string, string[]> {
  const badges = new Map<string, string[]>();
  // Tier badge
  for (const m of arr) {
    const tier = tierFor(totalScore(m.scores));
    badges.set(m.id, [tier]);
  }
  // Per-dimension leader
  const dims: { key: ScoreKey | "total"; en: string }[] = [
    { key: "tech", en: "Best Tech" },
    { key: "commercial", en: "Best Deployment" },
    { key: "safety", en: "Safest" },
    { key: "scalability", en: "Most Scalable" },
    { key: "data", en: "Best Data" },
  ];
  for (const d of dims) {
    const winner = [...arr].sort((a, b) => b.scores[d.key as ScoreKey] - a.scores[d.key as ScoreKey])[0];
    if (winner) {
      const list = badges.get(winner.id) || [];
      list.push(d.en);
      badges.set(winner.id, list);
    }
  }
  return badges;
}
