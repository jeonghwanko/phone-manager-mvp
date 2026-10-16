(function (root) {
  function planFor(list, gb) { return list.find(p => gb <= p.maxGB).price; }
  function installment(principal, ratePct, n) {
    if (principal <= 0) return { monthly: 0, interest: 0 };
    const r = ratePct / 100 / 12;
    const monthly = r === 0 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
    return { monthly, interest: monthly * n - principal };
  }
  function remainingMonths(endDate, today) {
    if (!endDate) return 0;
    const e = new Date(endDate), t = today || new Date();
    const m = (e.getFullYear() - t.getFullYear()) * 12 + (e.getMonth() - t.getMonth());
    return Math.max(0, m);
  }
  function compare(input, data, months) {
    const price = data.models[input.model].price;
    const c = data.carriers[input.carrier] || data.carriers["알뜰폰"];
    const target = data.carriers["SKT"]; // 번호이동 대상 예시
    const rate = input.rate != null ? input.rate : data.installmentRate;
    const gb = Number(input.dataGB) || 0;
    const rem = remainingMonths(input.contractEnd, input.today);
    const penalty = rem * c.penaltyPerMonth;
    const mno = planFor(data.mnoPlansByData, gb), mvno = planFor(data.mvnoPlansByData, gb);
    function mnoOption(name, carrier, subsidy, family, pen) {
      const inst = installment(price - subsidy, rate, months);
      const req = carrier.requiredMonths, reqCost = Math.max(carrier.requiredPlan, mno);
      const plan = reqCost * req + mno * (months - req);
      const addon = carrier.addon * carrier.addonMonths;
      const fam = family ? -carrier.familyDiscount * months : 0;
      return mk(name, price, -subsidy, inst.interest, plan, addon, fam, pen,
        `필수 요금제 ${req}개월 유지(월 ${won(reqCost)}) 후 월 ${won(mno)}`);
    }
    const opts = [];
    if (input.carrier !== "알뜰폰") opts.push(mnoOption("기기변경", c, c.subsidyChange, input.family, 0));
    opts.push(mnoOption("번호이동", input.carrier === "SKT" ? data.carriers["KT"] : target,
      (input.carrier === "SKT" ? data.carriers["KT"] : target).subsidyPort, false, penalty));
    const selfInst = installment(price, rate, months);
    opts.push(mk("자급제+알뜰폰", price, 0, selfInst.interest, mvno * months, 0, 0,
      input.carrier === "알뜰폰" ? 0 : penalty, `알뜰폰 요금 월 ${won(mvno)}, 카드 할부 가정`));
    opts.sort((a, b) => a.total - b.total);
    return { months, remaining: rem, options: opts, best: opts[0] };
  }
  function mk(name, device, subsidy, interest, plan, addon, family, penalty, note) {
    const total = Math.round(device + subsidy + interest + plan + addon + family + penalty);
    return { name, device, subsidy, interest: Math.round(interest), plan, addon, family, penalty, total, note };
  }
  function won(n) { return Math.round(n).toLocaleString("ko-KR") + "원"; }
  const api = { compare, installment, remainingMonths, won };
  if (typeof module !== "undefined") module.exports = api; else root.Engine = api;
})(this);
