<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.dreamsecurity.magicline.JCaosCheckCertInt"%>
<%@ page import="com.dreamsecurity.magicline.JCaosCheckCert"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509Certificate"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509GeneralName"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509OtherName"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509CertVerifier"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Base64"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Hex"%>
<%@ page import="com.dreamsecurity.jcaos.vid.VID"%>
<%@ page import="com.dreamsecurity.jcaos.cms.SignedData"%>
<%@ page import="com.dreamsecurity.jcaos.cms.SignerInfo"%>
<%@ page import="com.dreamsecurity.magice2e.MagicE2E" %>
<%@ page import="java.math.BigInteger"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="java.util.Properties"%>
<%@ page import="java.util.ArrayList"%>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.net.URLEncoder" %>
<%
    // 18.07.10 : 결과 확인을 위해 서명 원문 데이터르 가져옴
    String signOrigin = request.getParameter("signOrigin");
    if(signOrigin != null){
        signOrigin = new String(signOrigin.getBytes("8859_1"), "utf-8");
    }

    String sSignData = URLDecoder.decode(request.getParameter("sign"), "utf-8");
    String sVIDRandom = URLDecoder.decode(request.getParameter("vidRandom"), "utf-8");
    String sCdn = URLDecoder.decode(request.getParameter("cdn"), "utf-8");
    String sIdn = URLDecoder.decode(request.getParameter("idn"), "utf-8");

    String sResult = "";
    String sSourceText = "";
    String textCheck = "";
    String sSignerDn = "";
    String sIssuerDn = "";
    String sSerialNumber = "";
    String sCertificatePolicies = "";
    String sPolicy = "";
    String sVidCheck = "";
    String sIdentifyData = "";
    String sSignDate = "";

    sResult = sResult+"- SignData ["+sSignData+"]<br>\n"+"- VIDData ["+sVIDRandom+"]<br>\n";

    // 서명 데이타가 있을때 서명 검증
    if (sSignData != null && sSignData.length() > 0) {
        try	{

            // 개인정보 복호화 시작
            MagicE2E ml = (MagicE2E)session.getAttribute("Magie2e");
            String sEncData = request.getParameter("encData").replaceAll("&amp;quot;", "\"").replaceAll("&quot;", "\""); // 암호화 데이터
            HashMap<String, String> map = new HashMap<String, String>();
            StringBuffer sbPlain = new StringBuffer(); // 출력 버퍼
            System.out.println("- Encrypt Result ["+ sEncData +"]");

            // 암호 스트링이 있을때만 복호화
            if (sEncData != null && sEncData.length() > 0 && ml != null){
                int sDecryptResult = ml.decrypt(sEncData, sbPlain); // 복호화 상태값(0일 경우 정상)

                System.out.println("- sDecryptResult ["+ sDecryptResult +"]");
                System.out.println("- Decrypt Result ["+ java.net.URLDecoder.decode((String)sbPlain.toString(),"utf-8") +"]");

                // 복호화 데이터
                String[] parts = java.net.URLDecoder.decode((String)sbPlain.toString(),"utf-8").split("&");

                if ( parts.length > 1) {
                    for (String pair : parts) {
                        String[] kv = pair.split("=");
                        map.put(kv[0], kv[1]);
                    }
                }
                else {
                    String temp = java.net.URLDecoder.decode((String)sbPlain.toString(),"utf-8");
                    String[] kv = temp.split("=");
                    map.put( kv[0], kv[1] );
                }
            }
            // 개인정보 복호화 끝
            // WildRain 수정 2022-08-03
            // Mac 환경 설정
            //String sConfPath  =  "D:/ML4W/WS_svn/ML4W/MagicLine4Web/WebContent/WEB-INF/magicline/";           // conf경로, 앍고 쓰기 가능해야함
            String sConfPath  			= "/home/vcap/app/WEB-INF/magicline/";   		// cofn경로, 앍고 쓰기 가능해야함
            String magiclineCertsPath   = sConfPath + "certs/";  						// RootCa정보
            String magiclineConfPath    = sConfPath + "conf/";
            String jcaosLic             = sConfPath + "config/jcaos.lic";
            String magiclineProperties  = sConfPath + "config/magicline_cloud.properties";
            String urlConfigProperties  = sConfPath + "conf/urlconfig_cloud.properties";
            String caEnvInfoConf        = sConfPath + "conf/ca_env_info_cloud.conf";	//인증기관 LDAP정보

            // 내부망 인증서 검증 설정 START
            JCaosCheckCertInt jcaosCheck = new JCaosCheckCertInt(jcaosLic, magiclineProperties);
            //JCaosCheckCert jcaosCheck = new JCaosCheckCert("/Users/neo/workspace/globalcerti-git/src/main/webapp/WEB-INF/magicline/config/magicline.properties");


            // ROOT 인증서를 세팅한다
            // 검증하려는 인증서의 ROOT를 설정한다
            // 기본 설정은 NPKI 1024,2048 상용 인증서만 검증
            String sRootCerts[] = {
                // NPKI 인증서 처리를 위한 Root 인증서
                    magiclineCertsPath+"GPKIRootCA1.der",
                    magiclineCertsPath+"GPKIRootCA3.der",
                    magiclineCertsPath+"KISARootCA1.der",
                    magiclineCertsPath+"KISARootCA4.der"
            };

            // OCSP 검증을 위한 세팅
            String sOCSPUrl = null;
            byte[] byOCSPCert = null;
            byte[] byOCSPPriKey = null;
            String sOCSPPassword = null;
            int iOCSPCheckMethod = X509CertVerifier.REVOCATION_CHECK_BY_CRL; // CRL  만 검증

            int iRes = jcaosCheck.init(caEnvInfoConf, sRootCerts, sOCSPUrl, byOCSPCert, byOCSPPriKey,sOCSPPassword, iOCSPCheckMethod);

            if (iRes != 0) {
                System.out.println("- JCaosCheckCert.init Fail [" + iRes + "]<br>");
            }
            else {
                System.out.println("- JCaosCheckCert.init Success!!!<br>");
            }

            jcaosCheck.setCRL(true, sConfPath + "conf/urlconfig_local.properties");
            jcaosCheck.setCertVerifyDir(sConfPath + "/conf");
            // 내부망 인증서 검증 설정 END




            // 서버가 알고 잇는 주민등록 번호를 등록한다
            //jcaosCheck.setVIDRandom(map.get("encIdn"), sVIDRandom);
            jcaosCheck.setVIDRandom(sIdn, sVIDRandom);

            sResult = sResult+"<br>\n- 인증서 검증 시작<br>\n";

            // 서명 검증
            // 검증후 원문이 리턴됨
            int iResult = jcaosCheck.checkCert(sSignData);

            /*
            - JCaosCheckCert.checkCert 의 에러코드는 하기와 같습니다.
            JCaosCheckCert.STAT_OK										// 성공
            JCaosCheckCert.STAT_ERR_WRONGCERT							// 정상적인 인증서가 아님
            JCaosCheckCert.STAT_ERR_ETC									// 기타 오류
            JCaosCheckCert.STAT_ERR_VerifyException 					// 서명 검증 실패
            JCaosCheckCert.STAT_ERR_CertificateNotYetValidException 	// 인증서 유효기간 검증 오류
            JCaosCheckCert.STAT_ERR_CertificateExpiredException 		// 인증서 만료
            JCaosCheckCert.STAT_ERR_ObtainCertPathException				// 인증서 경로 구축 실패
            JCaosCheckCert.STAT_ERR_BuildCertPathException 				// 인증서 경로 구축 실패
            JCaosCheckCert.STAT_ERR_TrustRootException 					// 신뢰할수 없는 최상위 인증서
            JCaosCheckCert.STAT_ERR_ValidateCertPathException			// 인증서 경로 검증 실패
            JCaosCheckCert.STAT_ERR_RevokedCertException				// 폐지된 인증서
            JCaosCheckCert.STAT_ERR_RevocationCheckException			// CRL 검증 실패
            JCaosCheckCert.STAT_ERR_NotExistSignerCertException			// 서명자 인증서 누락
            JCaosCheckCert.STAT_ERR_IOException							// IOException
            JCaosCheckCert.STAT_ERR_FileNotFoundException				// FileNotFoundException
            JCaosCheckCert.STAT_ERR_NoSuchAlgorithmException			// NoSuchAlgorithmException
            JCaosCheckCert.STAT_ERR_NoSuchProviderException 			// NoSuchProviderException
            JCaosCheckCert.STAT_ERR_ParsingException        			// ParsingException
            JCaosCheckCert.STAT_ERR_IdentifyException       			// 본인확인 실패
            */

            // 1800 오류일때 사업자번호(cdn) 값으로 다시 확인
            if (iResult == 1800) {
                // 사업자번호를 등록한다.
                jcaosCheck.setVIDRandom(sCdn, sVIDRandom);

                sResult = sResult+"<br>\n- 인증서 검증  재시작<br>\n";

                // 서명 검증
                // 검증후 원문이 리턴됨
                iResult = jcaosCheck.checkCert(sSignData);
            }

            if ( iResult == 0 ) {
                sResult = sResult+ "- 인증서 검증 성공<br>\n";
            }
            else if( iResult == 3000 ) {
                sResult = sResult+ "- 인증서 검증 하지않음<br>\n";
            }
            else if ( iResult != 0 ) {
                // 오류 발생시 오류를 구분
                String sCertResult = null;
                switch(iResult){
                    case JCaosCheckCertInt.STAT_ERR_WRONGCERT :                     // 정상적인 인증서가 아님
                        sCertResult = "서명에 사용된 인증서가 정상적인 인증서가 아닙니다.";
                        break;
                    case JCaosCheckCertInt.STAT_ERR_RevocationCheckException :      // CRL 검증 실패
                    case JCaosCheckCertInt.STAT_ERR_NotExistSignerCertException :   // 서명자 인증서 누락
                    case JCaosCheckCertInt.STAT_ERR_IOException						:	// IOException
                    case JCaosCheckCertInt.STAT_ERR_FileNotFoundException				:	// FileNotFoundException
                    case JCaosCheckCertInt.STAT_ERR_ETC								:	// 기타 오류
                    case JCaosCheckCertInt.STAT_ERR_BuildCertPathException 			:	// 인증서 경로 구축 실패
                    case JCaosCheckCertInt.STAT_ERR_ObtainCertPathException			:	// 인증서 경로 구축 실패
                    case JCaosCheckCertInt.STAT_ERR_ValidateCertPathException			:	// 인증서 경로 검증 실패
                    case JCaosCheckCertInt.STAT_ERR_TrustRootException 				:	// 신뢰할수 없는 최상위 인증서
                        sCertResult = "서명 인증서 검증 오류 ["+iResult+"].";
                        break;
                    case JCaosCheckCertInt.STAT_ERR_VerifyException 					:	// 서명 검증 실패
                        sCertResult = "서명 검증 실패";
                        break;
                    case JCaosCheckCertInt.STAT_ERR_CertificateNotYetValidException	: 	// 인증서 유효기간 검증 오류
                        sCertResult = "서명 인증서 유효기간 검증 오류";
                        break;
                    case JCaosCheckCertInt.STAT_ERR_CertificateExpiredException 		:	// 인증서 만료
                        sCertResult = "만료된 인증서 ";
                        break;
                    case JCaosCheckCertInt.STAT_ERR_RevokedCertException				:	// 폐지된 인증서
                        sCertResult = "폐지된 인증서";
                        break;
                    default:
                        sCertResult = "기타오류 ["+iResult+"]";
                        break;
                }
                sResult = "<br>\n- "+sCertResult+" \n[" + jcaosCheck.getLastErr() +"]<br>\n\n";

            }

            if( iResult == 0 || iResult == 3000 ){
                // 서명에 사용된 인증서를 가져온다
                X509Certificate cert = jcaosCheck.getUserCert();
                String signerDN = cert.getSubjectDN().getName();	// 인증서 DN
                BigInteger serialNumber = cert.getSerialNumber();	// 인증서 시리얼

                // 본인확인
                switch (jcaosCheck.getVIDCheck()){
                    case JCaosCheckCertInt.STAT_VID_NOTCHECK:
                        sResult = sResult+"- 본인 확인 하지 않음<br>\n";
                        break;
                    case JCaosCheckCertInt.STAT_VID_CHECK_OK:
                        sResult = sResult+"- 본인 확인 성공<br>\n";
                        break;
                    case JCaosCheckCertInt.STAT_VID_CHECK_FAIL:
                        sResult = sResult+"- 본인 확인 실패<br>\n";
                        break;
                }

                // 서명 값 (Base64)
                String base64SignData = sSignData;

                // 서명 원문을 가져온다
                //sSourceText = jcaosCheck.getSrcStr("UTF-8");		// 원문의 인코딩을 알고 있어어야 한다 생략시 UTF-8 로 인코딩한다

                //byte[] textByte = Base64.decode(textCheck);
                sSourceText = new String( jcaosCheck.getSrcByte(), "utf-8" );
                //System.out.println("[TRACE] sSourceText :: " + sSourceText);
                // URL 형식 문자열을 잘라서 서명원문을 가져온다
                // ex) sign=&signOrigin=1234&vidRandom=&vidType=client&encData=&signData=1234&idn=
                //String sSourceTextVal = sSourceText.substring(sSourceText.indexOf("signData="));
                //sSourceText = sSourceTextVal.substring(sSourceTextVal.indexOf("=")+1, sSourceTextVal.indexOf("&idn="));

                //byte[] textByte = Base64.decode(textCheck);
                //sSourceText = new String(textByte, "utf-8");

                Properties props = new Properties();
                props.load(pageContext.getServletContext().getResourceAsStream("/MagicLine4Web/ML4Web/js/message/Messages.properties"));

                sPolicy = props.getProperty("OID_" + cert.getCertificatePolicies().getPolicyIdentifier(0).replace(".", "_"));

                ArrayList generalNames = cert.getSubjectAlternativeName();
                if (generalNames != null && generalNames.size() > 0) {
                    X509GeneralName genName;
                    for (int i=0; i<generalNames.size(); i++) {
                        genName = (X509GeneralName)generalNames.get(i);
                        if (genName.getType() == X509GeneralName.TYPE_OTHER_NAME) {
                            String identifyData = genName.getStringName();

                            X509OtherName otherName = X509OtherName.getInstance(((X509GeneralName)generalNames.get(i)).getOtherName());
                            VID vid = VID.getInstance(otherName.getIdentifyData().getVid());
                            sIdentifyData = new String(Hex.encode(vid.getVirtualID()));
                        }
                    }
                }

                // 화면 출력값 생성
                sResult = sResult+  "<br>\n- 사용자 DN ["+signerDN+"]<br>\n"+"<br>\n";
                sResult = sResult+  "- 발급자 DN ["+cert.getIssuerDN().getName()+"]<br>\n"+"<br>\n";
                sResult = sResult+  "- 인증서 SN ["+cert.getSerialNumber().toString(16)+"]<br>\n"+"<br>\n";
                sResult = sResult+  "- 인증서 정책 ["+cert.getCertificatePolicies().getPolicyIdentifier(0)+"]<br>\n"+"<br>\n";
                sResult = sResult+  "- 인증서 구분 ["+sPolicy+"]<br>\n"+"<br>\n";
                sResult = sResult+  "- 본인확인 식별값 ["+sIdentifyData+"]<br>\n"+"<br>\n";
            }

        }
        catch(Exception e){
            // 인증서 검증중 오류가 난 경우
            // 처리를 편하게 하기 위해
            // 상용중에는 사용자의 인증서의 유효성의 문제가 잇는 경우가 대부분 입니다.
            //
            e.printStackTrace();
            sResult = "서명 검증에 실패 하였습니다.\n [" + e.getMessage()+"]\");";
        }
    }
    else{
        sResult=" - 서명 데이타가 존재하지 않습니다..<br>\n";
    }
    //out.print(sResult);
    //System.out.println(sResult);
%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<div id="middle">
    <h2>MagicLine Digital Signature Result</h2>
    <div id="workArea"><!-- DIV START  -->
        <table class="styledLeft">
            <tr>
                <td style="border: 0;"><nobr> Digital Signature Result </nobr></td>
            </tr>
            <tr>
                <td style="border: 0;">&nbsp;</td>
            </tr>
            <tr>
                <td>
                    <table style="border: 0;">
                        <tbody>
                        <tr style="border: 0;">
                            <td style="border: 0; ">
                                <nobr> description  :
                                </nobr></td>
                            <td style="border: 0;">
                                사용자가 선택한 인증서를 이용하여 원문데이터에 전자서명값을 추출하여 서버에서 전자서명 검증을 실행하며<br/>
                                서버는 사용자 인증서의 유효성 여부를 확인한다.<br/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>
        <p>&nbsp;</p>
        <form action="login_renewR.jsp" method="post" name="popForm">
            <table style="width: 100%" class="styledLeft">
                <thead>
                <tr>
                    <th colspan="2">Client Digital Signature Request Data</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td class="formRow">
                        <table class="normal" cellspacing="0">
                            <tr>
                                <td>서명원문</td>
                                <td id="signOrigin"><%=signOrigin%></td>
                            </tr>
                            <tr>
                                <td>서명결과</td>
                                <td id="signResult"><%=sSourceText %></td>
                            </tr>
                            <tr>
                                <td>일치여부</td>
                                <td id="resultArea"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
            <p>&nbsp;</p>
            <table style="width: 100%" class="styledLeft">
                <thead>
                <tr>
                    <th colspan="2">Client Certificate Information</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td class="formRow">
                        <table class="normal" cellspacing="0">
                            <tr>
                                <td>sResult:</td>
                                <td><%=sResult%></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
        </form>
        <p>&nbsp;</p>

    </div>
</div><!-- DIV END  -->
<script type="text/javascript">
    $(window).load(function(){

        var origin = $("#signOrigin").text();
        var result = $("#signResult").text();
        var resultDOM = document.getElementById("resultArea");

        if(origin == result){
            resultDOM.innerHTML = "<b><font color='green'>MATCHED</font></b>";
        }else{
            resultDOM.innerHTML = "<b><font color='red'>MISMATCHED</font></b>";
        }

    });
</script>
<jsp:include page="include/footer.jsp"></jsp:include>