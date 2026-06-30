<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<%
    String sessionId = request.getParameter("sessionId");
%>

<script type="text/javascript">
    function doReSignData(){
        var plainText = $("#plainText").val();
        var sessionId = $("#sessionId").val();

        if(plainText.length < 1 || sessionId.length < 1){
            alert('원문 혹은 세션아이디를 입력하세요.');
            return;
        }
        document.reqForm.signOrigin.value = document.reqForm.plainText.value;
        magicline.uiapi.AutoMakeSignData( plainText, sessionId, null, mlCallBack);
    }

    function mlCallBack(code, message) {
        if (code == 0) {
            //document.reqForm.sign.value = encodeURIComponent(message.encMsg);
            document.reqForm.sign.value = message.encMsg;
            $("#signedData").val( $('input[name="sign"]').val());
        } else {
            alert("결과값 수신에 실패하였습니다.");
            return;
        }
    }
</script>

<div id="middle">
    <h2>MagicLine Digital Signature Result</h2>
    <div id="workArea">
        <table style="width: 100%; height:100%" class="styledLeft">
            <thead>
            <tr>
                <th colspan="2">Description</th>
            </tr>
            </thead>
            <tr>
                <td>
                    세션 스토리지에 인증서 및 암호화된 개인키 등의 정보가 저장됨.<br>
                    이후 원문과 세션 아이디 정보를 입력하여 magicLineUI를 호출하지 않고 서명을 수행한다.
                </td>
            </tr>
        </table>

        <p></p>
        <form id='reqForm' name='reqForm' method='post'>
            <input type="hidden" id='sign' name='sign'/>
            <input type="hidden" id='signOrigin' name='signOrigin'/>

            <table style="width: 100%; height:100%" class="styledLeft">
                <tbody>
                    <tr>
                        <td class="formRow">
                            <table class="normal" cellspacing="0" style="text-align: left;">
                                <tr>
                                    <td>전자서명 원문 데이터 입력</td>
                                    <td>
                                        <textarea id="plainText" name="plainText" rows="3" cols="60"></textarea>
                                    </td>
                                </tr>
                                <tr>
                                    <td>sessionId 입력</td>
                                    <td>
                                        <textarea id="sessionId" name="sessionId" rows="3" cols="60"><%=sessionId%></textarea>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" class="buttonRow" align="center">
                            <input id="doSignData" type="button" class="button" value="재서명" onclick="doReSignData();">
                        </td>
                    </tr>
                </tbody>
            </table>
            <p></p>

            <table style="width: 100%; height:100%" class="styledLeft">
                <tbody>
                    <tr>
                        <td class="formRow">
                            <table class="normal" cellspacing="0" style="text-align: left;">
                                <tr>
                                    <td>서명값 출력</td>
                                    <td>
                                        <textarea id="signedData" name="signedData" rows="10" cols="120"></textarea>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    </div>
</div>
<div id="selectCertContainer1" style="width:100%;margin-top:0; display:none;"></div>
<div id="startCs" style="width:100%;margin-top:0; display:none;"></div>

<jsp:include page="include/footer.jsp"></jsp:include>