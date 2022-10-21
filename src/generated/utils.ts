/* istanbul ignore file */

import { PolymeshPrimitivesJurisdictionCountryCode } from '@polkadot/types/lookup';

import { Context } from '~/internal';
import { CountryCode } from '~/types';

/**
 * @hidden
 */
export function countryCodeToMeshCountryCode(
  countryCode: CountryCode,
  context: Context
): PolymeshPrimitivesJurisdictionCountryCode {
  return context.createType('PolymeshPrimitivesJurisdictionCountryCode', countryCode);
}

/**
 * @hidden
 */
export function meshCountryCodeToCountryCode(
  meshCountryCode: PolymeshPrimitivesJurisdictionCountryCode
): CountryCode {
  if (meshCountryCode.isAf) {
    return CountryCode.Af;
  }

  if (meshCountryCode.isAx) {
    return CountryCode.Ax;
  }

  if (meshCountryCode.isAl) {
    return CountryCode.Al;
  }

  if (meshCountryCode.isDz) {
    return CountryCode.Dz;
  }

  if (meshCountryCode.isAs) {
    return CountryCode.As;
  }

  if (meshCountryCode.isAd) {
    return CountryCode.Ad;
  }

  if (meshCountryCode.isAo) {
    return CountryCode.Ao;
  }

  if (meshCountryCode.isAi) {
    return CountryCode.Ai;
  }

  if (meshCountryCode.isAq) {
    return CountryCode.Aq;
  }

  if (meshCountryCode.isAg) {
    return CountryCode.Ag;
  }

  if (meshCountryCode.isAr) {
    return CountryCode.Ar;
  }

  if (meshCountryCode.isAm) {
    return CountryCode.Am;
  }

  if (meshCountryCode.isAw) {
    return CountryCode.Aw;
  }

  if (meshCountryCode.isAu) {
    return CountryCode.Au;
  }

  if (meshCountryCode.isAt) {
    return CountryCode.At;
  }

  if (meshCountryCode.isAz) {
    return CountryCode.Az;
  }

  if (meshCountryCode.isBs) {
    return CountryCode.Bs;
  }

  if (meshCountryCode.isBh) {
    return CountryCode.Bh;
  }

  if (meshCountryCode.isBd) {
    return CountryCode.Bd;
  }

  if (meshCountryCode.isBb) {
    return CountryCode.Bb;
  }

  if (meshCountryCode.isBy) {
    return CountryCode.By;
  }

  if (meshCountryCode.isBe) {
    return CountryCode.Be;
  }

  if (meshCountryCode.isBz) {
    return CountryCode.Bz;
  }

  if (meshCountryCode.isBj) {
    return CountryCode.Bj;
  }

  if (meshCountryCode.isBm) {
    return CountryCode.Bm;
  }

  if (meshCountryCode.isBt) {
    return CountryCode.Bt;
  }

  if (meshCountryCode.isBo) {
    return CountryCode.Bo;
  }

  if (meshCountryCode.isBa) {
    return CountryCode.Ba;
  }

  if (meshCountryCode.isBw) {
    return CountryCode.Bw;
  }

  if (meshCountryCode.isBv) {
    return CountryCode.Bv;
  }

  if (meshCountryCode.isBr) {
    return CountryCode.Br;
  }

  if (meshCountryCode.isVg) {
    return CountryCode.Vg;
  }

  if (meshCountryCode.isIo) {
    return CountryCode.Io;
  }

  if (meshCountryCode.isBn) {
    return CountryCode.Bn;
  }

  if (meshCountryCode.isBg) {
    return CountryCode.Bg;
  }

  if (meshCountryCode.isBf) {
    return CountryCode.Bf;
  }

  if (meshCountryCode.isBi) {
    return CountryCode.Bi;
  }

  if (meshCountryCode.isKh) {
    return CountryCode.Kh;
  }

  if (meshCountryCode.isCm) {
    return CountryCode.Cm;
  }

  if (meshCountryCode.isCa) {
    return CountryCode.Ca;
  }

  if (meshCountryCode.isCv) {
    return CountryCode.Cv;
  }

  if (meshCountryCode.isKy) {
    return CountryCode.Ky;
  }

  if (meshCountryCode.isCf) {
    return CountryCode.Cf;
  }

  if (meshCountryCode.isTd) {
    return CountryCode.Td;
  }

  if (meshCountryCode.isCl) {
    return CountryCode.Cl;
  }

  if (meshCountryCode.isCn) {
    return CountryCode.Cn;
  }

  if (meshCountryCode.isHk) {
    return CountryCode.Hk;
  }

  if (meshCountryCode.isMo) {
    return CountryCode.Mo;
  }

  if (meshCountryCode.isCx) {
    return CountryCode.Cx;
  }

  if (meshCountryCode.isCc) {
    return CountryCode.Cc;
  }

  if (meshCountryCode.isCo) {
    return CountryCode.Co;
  }

  if (meshCountryCode.isKm) {
    return CountryCode.Km;
  }

  if (meshCountryCode.isCg) {
    return CountryCode.Cg;
  }

  if (meshCountryCode.isCd) {
    return CountryCode.Cd;
  }

  if (meshCountryCode.isCk) {
    return CountryCode.Ck;
  }

  if (meshCountryCode.isCr) {
    return CountryCode.Cr;
  }

  if (meshCountryCode.isCi) {
    return CountryCode.Ci;
  }

  if (meshCountryCode.isHr) {
    return CountryCode.Hr;
  }

  if (meshCountryCode.isCu) {
    return CountryCode.Cu;
  }

  if (meshCountryCode.isCy) {
    return CountryCode.Cy;
  }

  if (meshCountryCode.isCz) {
    return CountryCode.Cz;
  }

  if (meshCountryCode.isDk) {
    return CountryCode.Dk;
  }

  if (meshCountryCode.isDj) {
    return CountryCode.Dj;
  }

  if (meshCountryCode.isDm) {
    return CountryCode.Dm;
  }

  if (meshCountryCode.isDo) {
    return CountryCode.Do;
  }

  if (meshCountryCode.isEc) {
    return CountryCode.Ec;
  }

  if (meshCountryCode.isEg) {
    return CountryCode.Eg;
  }

  if (meshCountryCode.isSv) {
    return CountryCode.Sv;
  }

  if (meshCountryCode.isGq) {
    return CountryCode.Gq;
  }

  if (meshCountryCode.isEr) {
    return CountryCode.Er;
  }

  if (meshCountryCode.isEe) {
    return CountryCode.Ee;
  }

  if (meshCountryCode.isEt) {
    return CountryCode.Et;
  }

  if (meshCountryCode.isFk) {
    return CountryCode.Fk;
  }

  if (meshCountryCode.isFo) {
    return CountryCode.Fo;
  }

  if (meshCountryCode.isFj) {
    return CountryCode.Fj;
  }

  if (meshCountryCode.isFi) {
    return CountryCode.Fi;
  }

  if (meshCountryCode.isFr) {
    return CountryCode.Fr;
  }

  if (meshCountryCode.isGf) {
    return CountryCode.Gf;
  }

  if (meshCountryCode.isPf) {
    return CountryCode.Pf;
  }

  if (meshCountryCode.isTf) {
    return CountryCode.Tf;
  }

  if (meshCountryCode.isGa) {
    return CountryCode.Ga;
  }

  if (meshCountryCode.isGm) {
    return CountryCode.Gm;
  }

  if (meshCountryCode.isGe) {
    return CountryCode.Ge;
  }

  if (meshCountryCode.isDe) {
    return CountryCode.De;
  }

  if (meshCountryCode.isGh) {
    return CountryCode.Gh;
  }

  if (meshCountryCode.isGi) {
    return CountryCode.Gi;
  }

  if (meshCountryCode.isGr) {
    return CountryCode.Gr;
  }

  if (meshCountryCode.isGl) {
    return CountryCode.Gl;
  }

  if (meshCountryCode.isGd) {
    return CountryCode.Gd;
  }

  if (meshCountryCode.isGp) {
    return CountryCode.Gp;
  }

  if (meshCountryCode.isGu) {
    return CountryCode.Gu;
  }

  if (meshCountryCode.isGt) {
    return CountryCode.Gt;
  }

  if (meshCountryCode.isGg) {
    return CountryCode.Gg;
  }

  if (meshCountryCode.isGn) {
    return CountryCode.Gn;
  }

  if (meshCountryCode.isGw) {
    return CountryCode.Gw;
  }

  if (meshCountryCode.isGy) {
    return CountryCode.Gy;
  }

  if (meshCountryCode.isHt) {
    return CountryCode.Ht;
  }

  if (meshCountryCode.isHm) {
    return CountryCode.Hm;
  }

  if (meshCountryCode.isVa) {
    return CountryCode.Va;
  }

  if (meshCountryCode.isHn) {
    return CountryCode.Hn;
  }

  if (meshCountryCode.isHu) {
    return CountryCode.Hu;
  }

  if (meshCountryCode.isIs) {
    return CountryCode.Is;
  }

  if (meshCountryCode.isIn) {
    return CountryCode.In;
  }

  if (meshCountryCode.isId) {
    return CountryCode.Id;
  }

  if (meshCountryCode.isIr) {
    return CountryCode.Ir;
  }

  if (meshCountryCode.isIq) {
    return CountryCode.Iq;
  }

  if (meshCountryCode.isIe) {
    return CountryCode.Ie;
  }

  if (meshCountryCode.isIm) {
    return CountryCode.Im;
  }

  if (meshCountryCode.isIl) {
    return CountryCode.Il;
  }

  if (meshCountryCode.isIt) {
    return CountryCode.It;
  }

  if (meshCountryCode.isJm) {
    return CountryCode.Jm;
  }

  if (meshCountryCode.isJp) {
    return CountryCode.Jp;
  }

  if (meshCountryCode.isJe) {
    return CountryCode.Je;
  }

  if (meshCountryCode.isJo) {
    return CountryCode.Jo;
  }

  if (meshCountryCode.isKz) {
    return CountryCode.Kz;
  }

  if (meshCountryCode.isKe) {
    return CountryCode.Ke;
  }

  if (meshCountryCode.isKi) {
    return CountryCode.Ki;
  }

  if (meshCountryCode.isKp) {
    return CountryCode.Kp;
  }

  if (meshCountryCode.isKr) {
    return CountryCode.Kr;
  }

  if (meshCountryCode.isKw) {
    return CountryCode.Kw;
  }

  if (meshCountryCode.isKg) {
    return CountryCode.Kg;
  }

  if (meshCountryCode.isLa) {
    return CountryCode.La;
  }

  if (meshCountryCode.isLv) {
    return CountryCode.Lv;
  }

  if (meshCountryCode.isLb) {
    return CountryCode.Lb;
  }

  if (meshCountryCode.isLs) {
    return CountryCode.Ls;
  }

  if (meshCountryCode.isLr) {
    return CountryCode.Lr;
  }

  if (meshCountryCode.isLy) {
    return CountryCode.Ly;
  }

  if (meshCountryCode.isLi) {
    return CountryCode.Li;
  }

  if (meshCountryCode.isLt) {
    return CountryCode.Lt;
  }

  if (meshCountryCode.isLu) {
    return CountryCode.Lu;
  }

  if (meshCountryCode.isMk) {
    return CountryCode.Mk;
  }

  if (meshCountryCode.isMg) {
    return CountryCode.Mg;
  }

  if (meshCountryCode.isMw) {
    return CountryCode.Mw;
  }

  if (meshCountryCode.isMy) {
    return CountryCode.My;
  }

  if (meshCountryCode.isMv) {
    return CountryCode.Mv;
  }

  if (meshCountryCode.isMl) {
    return CountryCode.Ml;
  }

  if (meshCountryCode.isMt) {
    return CountryCode.Mt;
  }

  if (meshCountryCode.isMh) {
    return CountryCode.Mh;
  }

  if (meshCountryCode.isMq) {
    return CountryCode.Mq;
  }

  if (meshCountryCode.isMr) {
    return CountryCode.Mr;
  }

  if (meshCountryCode.isMu) {
    return CountryCode.Mu;
  }

  if (meshCountryCode.isYt) {
    return CountryCode.Yt;
  }

  if (meshCountryCode.isMx) {
    return CountryCode.Mx;
  }

  if (meshCountryCode.isFm) {
    return CountryCode.Fm;
  }

  if (meshCountryCode.isMd) {
    return CountryCode.Md;
  }

  if (meshCountryCode.isMc) {
    return CountryCode.Mc;
  }

  if (meshCountryCode.isMn) {
    return CountryCode.Mn;
  }

  if (meshCountryCode.isMe) {
    return CountryCode.Me;
  }

  if (meshCountryCode.isMs) {
    return CountryCode.Ms;
  }

  if (meshCountryCode.isMa) {
    return CountryCode.Ma;
  }

  if (meshCountryCode.isMz) {
    return CountryCode.Mz;
  }

  if (meshCountryCode.isMm) {
    return CountryCode.Mm;
  }

  if (meshCountryCode.isNa) {
    return CountryCode.Na;
  }

  if (meshCountryCode.isNr) {
    return CountryCode.Nr;
  }

  if (meshCountryCode.isNp) {
    return CountryCode.Np;
  }

  if (meshCountryCode.isNl) {
    return CountryCode.Nl;
  }

  if (meshCountryCode.isAn) {
    return CountryCode.An;
  }

  if (meshCountryCode.isNc) {
    return CountryCode.Nc;
  }

  if (meshCountryCode.isNz) {
    return CountryCode.Nz;
  }

  if (meshCountryCode.isNi) {
    return CountryCode.Ni;
  }

  if (meshCountryCode.isNe) {
    return CountryCode.Ne;
  }

  if (meshCountryCode.isNg) {
    return CountryCode.Ng;
  }

  if (meshCountryCode.isNu) {
    return CountryCode.Nu;
  }

  if (meshCountryCode.isNf) {
    return CountryCode.Nf;
  }

  if (meshCountryCode.isMp) {
    return CountryCode.Mp;
  }

  if (meshCountryCode.isNo) {
    return CountryCode.No;
  }

  if (meshCountryCode.isOm) {
    return CountryCode.Om;
  }

  if (meshCountryCode.isPk) {
    return CountryCode.Pk;
  }

  if (meshCountryCode.isPw) {
    return CountryCode.Pw;
  }

  if (meshCountryCode.isPs) {
    return CountryCode.Ps;
  }

  if (meshCountryCode.isPa) {
    return CountryCode.Pa;
  }

  if (meshCountryCode.isPg) {
    return CountryCode.Pg;
  }

  if (meshCountryCode.isPy) {
    return CountryCode.Py;
  }

  if (meshCountryCode.isPe) {
    return CountryCode.Pe;
  }

  if (meshCountryCode.isPh) {
    return CountryCode.Ph;
  }

  if (meshCountryCode.isPn) {
    return CountryCode.Pn;
  }

  if (meshCountryCode.isPl) {
    return CountryCode.Pl;
  }

  if (meshCountryCode.isPt) {
    return CountryCode.Pt;
  }

  if (meshCountryCode.isPr) {
    return CountryCode.Pr;
  }

  if (meshCountryCode.isQa) {
    return CountryCode.Qa;
  }

  if (meshCountryCode.isRe) {
    return CountryCode.Re;
  }

  if (meshCountryCode.isRo) {
    return CountryCode.Ro;
  }

  if (meshCountryCode.isRu) {
    return CountryCode.Ru;
  }

  if (meshCountryCode.isRw) {
    return CountryCode.Rw;
  }

  if (meshCountryCode.isBl) {
    return CountryCode.Bl;
  }

  if (meshCountryCode.isSh) {
    return CountryCode.Sh;
  }

  if (meshCountryCode.isKn) {
    return CountryCode.Kn;
  }

  if (meshCountryCode.isLc) {
    return CountryCode.Lc;
  }

  if (meshCountryCode.isMf) {
    return CountryCode.Mf;
  }

  if (meshCountryCode.isPm) {
    return CountryCode.Pm;
  }

  if (meshCountryCode.isVc) {
    return CountryCode.Vc;
  }

  if (meshCountryCode.isWs) {
    return CountryCode.Ws;
  }

  if (meshCountryCode.isSm) {
    return CountryCode.Sm;
  }

  if (meshCountryCode.isSt) {
    return CountryCode.St;
  }

  if (meshCountryCode.isSa) {
    return CountryCode.Sa;
  }

  if (meshCountryCode.isSn) {
    return CountryCode.Sn;
  }

  if (meshCountryCode.isRs) {
    return CountryCode.Rs;
  }

  if (meshCountryCode.isSc) {
    return CountryCode.Sc;
  }

  if (meshCountryCode.isSl) {
    return CountryCode.Sl;
  }

  if (meshCountryCode.isSg) {
    return CountryCode.Sg;
  }

  if (meshCountryCode.isSk) {
    return CountryCode.Sk;
  }

  if (meshCountryCode.isSi) {
    return CountryCode.Si;
  }

  if (meshCountryCode.isSb) {
    return CountryCode.Sb;
  }

  if (meshCountryCode.isSo) {
    return CountryCode.So;
  }

  if (meshCountryCode.isZa) {
    return CountryCode.Za;
  }

  if (meshCountryCode.isGs) {
    return CountryCode.Gs;
  }

  if (meshCountryCode.isSs) {
    return CountryCode.Ss;
  }

  if (meshCountryCode.isEs) {
    return CountryCode.Es;
  }

  if (meshCountryCode.isLk) {
    return CountryCode.Lk;
  }

  if (meshCountryCode.isSd) {
    return CountryCode.Sd;
  }

  if (meshCountryCode.isSr) {
    return CountryCode.Sr;
  }

  if (meshCountryCode.isSj) {
    return CountryCode.Sj;
  }

  if (meshCountryCode.isSz) {
    return CountryCode.Sz;
  }

  if (meshCountryCode.isSe) {
    return CountryCode.Se;
  }

  if (meshCountryCode.isCh) {
    return CountryCode.Ch;
  }

  if (meshCountryCode.isSy) {
    return CountryCode.Sy;
  }

  if (meshCountryCode.isTw) {
    return CountryCode.Tw;
  }

  if (meshCountryCode.isTj) {
    return CountryCode.Tj;
  }

  if (meshCountryCode.isTz) {
    return CountryCode.Tz;
  }

  if (meshCountryCode.isTh) {
    return CountryCode.Th;
  }

  if (meshCountryCode.isTl) {
    return CountryCode.Tl;
  }

  if (meshCountryCode.isTg) {
    return CountryCode.Tg;
  }

  if (meshCountryCode.isTk) {
    return CountryCode.Tk;
  }

  if (meshCountryCode.isTo) {
    return CountryCode.To;
  }

  if (meshCountryCode.isTt) {
    return CountryCode.Tt;
  }

  if (meshCountryCode.isTn) {
    return CountryCode.Tn;
  }

  if (meshCountryCode.isTr) {
    return CountryCode.Tr;
  }

  if (meshCountryCode.isTm) {
    return CountryCode.Tm;
  }

  if (meshCountryCode.isTc) {
    return CountryCode.Tc;
  }

  if (meshCountryCode.isTv) {
    return CountryCode.Tv;
  }

  if (meshCountryCode.isUg) {
    return CountryCode.Ug;
  }

  if (meshCountryCode.isUa) {
    return CountryCode.Ua;
  }

  if (meshCountryCode.isAe) {
    return CountryCode.Ae;
  }

  if (meshCountryCode.isGb) {
    return CountryCode.Gb;
  }

  if (meshCountryCode.isUs) {
    return CountryCode.Us;
  }

  if (meshCountryCode.isUm) {
    return CountryCode.Um;
  }

  if (meshCountryCode.isUy) {
    return CountryCode.Uy;
  }

  if (meshCountryCode.isUz) {
    return CountryCode.Uz;
  }

  if (meshCountryCode.isVu) {
    return CountryCode.Vu;
  }

  if (meshCountryCode.isVe) {
    return CountryCode.Ve;
  }

  if (meshCountryCode.isVn) {
    return CountryCode.Vn;
  }

  if (meshCountryCode.isVi) {
    return CountryCode.Vi;
  }

  if (meshCountryCode.isWf) {
    return CountryCode.Wf;
  }

  if (meshCountryCode.isEh) {
    return CountryCode.Eh;
  }

  if (meshCountryCode.isYe) {
    return CountryCode.Ye;
  }

  if (meshCountryCode.isZm) {
    return CountryCode.Zm;
  }

  if (meshCountryCode.isZw) {
    return CountryCode.Zw;
  }

  if (meshCountryCode.isBq) {
    return CountryCode.Bq;
  }

  if (meshCountryCode.isCw) {
    return CountryCode.Cw;
  }

  return CountryCode.Sx;
}
